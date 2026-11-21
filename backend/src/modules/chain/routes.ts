import { timingSafeEqual } from 'node:crypto';
import { Elysia, t } from 'elysia';
import { env } from '../../config/env';
import { ApiError } from '../../lib/errors';
import { chainStatus } from './ledger';
import { ChainService } from './service';

const nullable = <T extends ReturnType<typeof t.String> | ReturnType<typeof t.Number>>(s: T) => t.Union([s, t.Null()]);

const TokenDto = t.Object({
  propertyId: t.String(),
  tokenId: t.String(),
  propertyKey: t.String(),
  jurisdiction: t.String(),
  parcel: t.String(),
  status: t.String(),
  version: t.Number(),
  docRoot: t.String(),
  docCount: t.Number(),
  documents: t.Array(t.Object({ slot: t.String(), filename: t.String(), size: t.Number(), sha256: t.String() })),
  attestation: t.String(),
  approvedBy: t.String(),
  approvedAt: t.String(),
  network: t.String(),
  chainId: t.Number(),
  contract: t.String(),
  txHash: nullable(t.String()),
  explorerUrl: nullable(t.String()),
  blockNumber: nullable(t.Number()),
  metadataUrl: t.String(),
  error: nullable(t.String()),
  history: t.Array(
    t.Object({ kind: t.String(), version: t.Number(), docRoot: t.String(), txHash: t.String(), blockNumber: t.Number(), at: t.String(), explorerUrl: nullable(t.String()) }),
  ),
});

const OnChainDto = t.Object({
  ownerRef: t.String(),
  docRoot: t.String(),
  metadataHash: t.String(),
  attestation: t.String(),
  docCount: t.Number(),
  version: t.Number(),
  updatedAt: t.Number(),
  status: t.String(),
  encumbered: t.Boolean(),
  matches: t.Boolean(),
});

/** Approving writes to the chain with the platform registrar key, so it needs the lawyer console's admin token. */
function requireAdmin(authorization: string | undefined) {
  if (!env.CHAIN_ADMIN_TOKEN) {
    if (env.NODE_ENV === 'production') throw new ApiError(503, 'Service Unavailable', 'CHAIN_ADMIN_TOKEN is not configured.');
    return; // local development and tests
  }
  const given = authorization?.replace(/^Bearer\s+/i, '') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(env.CHAIN_ADMIN_TOKEN);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new ApiError(401, 'Unauthorized', 'Invalid or missing admin token.');
}

export const chainRoutes = new Elysia({ prefix: '/api/chain' })
  /** GET /api/chain/status: network, contract, registrar address and gas balance. */
  .get('/status', () => chainStatus(), {
    detail: { summary: 'Ledger status', tags: ['Chain'] },
    response: t.Union([
      t.Object({ configured: t.Literal(false), network: t.String() }),
      t.Object({
        configured: t.Literal(true), network: t.String(), chainId: t.Number(), contract: t.String(),
        registrar: t.String(), registrarBalance: t.String(), signer: t.String(),
      }),
    ]),
  })

  /** POST /api/chain/properties/:id/approve: lawyer sign-off, then register or update the token on-chain. */
  .post(
    '/properties/:id/approve',
    async ({ params, body, headers }) => {
      requireAdmin(headers.authorization);
      const { token, changed } = await ChainService.approve(params.id, body);
      return { changed, token };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({ approvedBy: t.String({ minLength: 1 }), ownerName: t.Optional(t.String()) }),
      detail: {
        summary: 'Approve a property and anchor its token',
        tags: ['Chain'],
        description:
          'Hashes every uploaded document, builds a Merkle root, stores the token metadata in Cloud Storage and registers the property token on-chain (or bumps its version when documents changed). Unchanged files return the existing token.',
      },
      response: t.Object({ changed: t.Boolean(), token: TokenDto }),
    },
  )

  /** GET /api/chain/properties/:id: the token, its history, and the live on-chain record. */
  .get('/properties/:id', ({ params }) => ChainService.getToken(params.id), {
    params: t.Object({ id: t.String() }),
    detail: { summary: 'Get the property token with its live on-chain record', tags: ['Chain'] },
    response: t.Object({ token: TokenDto, onChain: t.Union([OnChainDto, t.Null()]) }),
  })

  /** POST /api/chain/verify: hash an uploaded file and check it against the anchored documents. */
  .post('/verify', ({ body }) => ChainService.verifyFile(body.file, body.propertyId), {
    body: t.Object({
      file: t.File({ description: 'The document to check' }),
      propertyId: t.Optional(t.String({ description: 'Limit the check to this property' })),
    }),
    detail: {
      summary: 'Verify a document against the blockchain record',
      tags: ['Chain'],
      description: 'Returns match, changed or unknown. The file is hashed in memory and not stored.',
    },
    response: t.Object({
      verdict: t.Union([t.Literal('match'), t.Literal('changed'), t.Literal('unknown')]),
      sha256: t.String(),
      message: t.String(),
      propertyId: t.Optional(t.String()),
      tokenId: t.Optional(t.String()),
      network: t.Optional(t.String()),
      contract: t.Optional(t.String()),
      version: t.Optional(t.Number()),
      slot: t.Optional(t.String()),
      anchoredAt: t.Optional(t.String()),
      txHash: t.Optional(nullable(t.String())),
      explorerUrl: t.Optional(nullable(t.String())),
      encumbered: t.Optional(t.Boolean()),
    }),
  })

  /** GET /api/chain/metadata/:file: ERC-721 style metadata for tokenURI, e.g. /metadata/123….json */
  .get(
    '/metadata/:file',
    async ({ params, set }) => {
      set.headers['content-type'] = 'application/json';
      return (await ChainService.metadata(params.file.replace(/\.json$/, ''))).toString('utf8');
    },
    { params: t.Object({ file: t.String() }), detail: { summary: 'Token metadata (tokenURI target)', tags: ['Chain'] } },
  );

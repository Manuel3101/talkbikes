import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis/redis.service.js';
import { GbfsService } from './gbfs.service.js';

describe('GbfsService', () => {
  let service: GbfsService;
  const redis = { getJson: vi.fn(), setJson: vi.fn() };
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [GbfsService, { provide: RedisService, useValue: redis }],
    }).compile();

    service = module.get<GbfsService>(GbfsService);
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uses the cached GBFS file from redis without fetching', async () => {
    redis.getJson.mockResolvedValueOnce({
      data: { de: { feeds: [{ name: 'station_status', url: 'https://example.test/status' }] } },
    });
    fetchSpy.mockResolvedValueOnce(Response.json({ data: { stations: [] } }));

    await service.getStationStatus();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('https://example.test/status');
  });

  it('fetches and caches the GBFS file with its remaining ttl on a cache miss', async () => {
    const gbfs = {
      last_updated: Math.floor(Date.now() / 1000) - 10,
      ttl: 60,
      data: { de: { feeds: [{ name: 'station_status', url: 'https://example.test/status' }] } },
    };
    redis.getJson.mockResolvedValueOnce(null);
    fetchSpy.mockResolvedValueOnce(Response.json(gbfs)).mockResolvedValueOnce(Response.json({}));

    await service.getStationStatus();

    expect(redis.setJson).toHaveBeenCalledWith('gbfs:nextbike_kg', gbfs, expect.any(Number));
    const ttl = redis.setJson.mock.calls[0][2] as number;
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(50);
  });

  it('falls back to fetching when redis is unavailable', async () => {
    const gbfs = {
      last_updated: Math.floor(Date.now() / 1000),
      ttl: 60,
      data: { de: { feeds: [{ name: 'station_status', url: 'https://example.test/status' }] } },
    };
    redis.getJson.mockRejectedValueOnce(new Error('down'));
    redis.setJson.mockRejectedValueOnce(new Error('down'));
    fetchSpy.mockResolvedValueOnce(Response.json(gbfs)).mockResolvedValueOnce(Response.json({ ok: true }));

    await expect(service.getStationStatus()).resolves.toEqual({ ok: true });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from '../src/scan.service';
import { getQueueToken } from '@nestjs/bull';
import type { Queue } from 'bull';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScanService', () => {
  let service: ScanService;
  let queue: Pick<Queue, 'add'>;
  let testingModule: TestingModule;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    testingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        {
          provide: getQueueToken('ocr-tasks'),
          useValue: queue,
        },
      ],
    }).compile();

    service = testingModule.get<ScanService>(ScanService);
  });

  afterEach(async () => {
    await testingModule.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should queue an OCR task correctly', async () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'test.png',
    } as Express.Multer.File;

    mockedAxios.post.mockResolvedValue({ data: { hash: 'mocked-hash' } });

    const result = await service.queueOcrTask('user-1', mockFile);

    expect(result.success).toBe(true);
    expect(result.job_id).toBe('job-123');
    expect(result.initial_hash).toBe('mocked-hash');
    expect(queue.add).toHaveBeenCalled();
  });

  it('should throw error if security module fails', async () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'test.png',
    } as Express.Multer.File;

    mockedAxios.post.mockRejectedValue(new Error('Security failed'));

    await expect(service.queueOcrTask('user-1', mockFile)).rejects.toThrow();
  });
});

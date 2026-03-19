import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

import { JwtStrategy } from '../src/auth/jwt.strategy';

describe('AuthModule', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ JWT_SECRET: 'test-secret' })],
        }),
        AuthModule,
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(testingModule).toBeDefined();
  });

  it('should provide JwtStrategy', () => {
    const strategy = testingModule.get(JwtStrategy);
    expect(strategy).toBeDefined();
  });
});

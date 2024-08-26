import { status } from '@grpc/grpc-js';
import { describe, expect, it } from '@jest/globals';

import {
  ErrorDetailProtobufType,
  ErrorInfo,
  GrpcError,
  makeMetadataWithEncodedErrorDetails,
  StatusMessageType,
} from '.';

describe('makeMetadataWithEncodedErrorDetails', (): void => {
  it('creates metadata with an encoded error info object in the grpc-status-details-bin header', (): void => {
    expect.assertions(1);

    const errorInfo: ErrorInfo = {
      '@type': ErrorDetailProtobufType.ErrorInfo,
      domain: 'test',
      reason: 'super',
    };

    const metadata = makeMetadataWithEncodedErrorDetails(
      status.UNAUTHENTICATED,
      'message',
      errorInfo,
    );

    const [encoded] = metadata.get('grpc-status-details-bin');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const decoded = StatusMessageType.decode(Buffer.from(encoded!));

    expect(decoded.toJSON()).toStrictEqual({
      code: status.UNAUTHENTICATED,
      details: [errorInfo],
      message: 'message',
    });
  });
});

// eslint-disable-next-line jest/prefer-lowercase-title
describe('GrpcError', (): void => {
  it('is instance of grpc.Error and has expected properties', (): void => {
    expect.assertions(5);

    const errorInfo: ErrorInfo = {
      '@type': ErrorDetailProtobufType.ErrorInfo,
      domain: 'users',
      reason: 'super',
    };

    const grpcError = new GrpcError(status.ABORTED, 'message', errorInfo);

    expect(grpcError).toBeInstanceOf(Error);
    expect(grpcError.code).toBe(10);
    expect(grpcError.message).toBe('message');
    expect(grpcError.details).toBe('message');
    expect(grpcError.metadata.get('grpc-status-details-bin')).toBeDefined();
  });

  it.each([
    [status.ABORTED, ErrorDetailProtobufType.ErrorInfo],
    [status.PERMISSION_DENIED, ErrorDetailProtobufType.ErrorInfo],
    [status.UNAUTHENTICATED, ErrorDetailProtobufType.ErrorInfo],
    [status.ALREADY_EXISTS, ErrorDetailProtobufType.ResourceInfo],
    [status.DATA_LOSS, ErrorDetailProtobufType.DebugInfo],
    [status.DEADLINE_EXCEEDED, ErrorDetailProtobufType.DebugInfo],
    [status.FAILED_PRECONDITION, ErrorDetailProtobufType.PreconditionFailure],
    [status.INTERNAL, ErrorDetailProtobufType.DebugInfo],
    [status.INVALID_ARGUMENT, ErrorDetailProtobufType.BadRequest],
    [status.NOT_FOUND, ErrorDetailProtobufType.ResourceInfo],
    [status.OUT_OF_RANGE, ErrorDetailProtobufType.BadRequest],
    [status.RESOURCE_EXHAUSTED, ErrorDetailProtobufType.QuotaFailure],
    [status.UNAVAILABLE, ErrorDetailProtobufType.DebugInfo],
    [status.UNKNOWN, ErrorDetailProtobufType.DebugInfo],
  ])(
    'has the correct metadata when code is %d',
    (code: status, errorDetailType: ErrorDetailProtobufType): void => {
      expect.assertions(3);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      const grpcError = new GrpcError(code, 'message', {
        '@type': errorDetailType,
      } as any);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      /* eslint-enable @typescript-eslint/no-unsafe-argument */

      const [encoded] = grpcError.metadata.get('grpc-status-details-bin');

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const decoded = StatusMessageType.decode(Buffer.from(encoded!));

      const {
        code: decodedCode,
        message: decodedMessage,
        details: [{ '@type': type }],
      } = decoded.toJSON();

      expect(decodedCode).toStrictEqual(code);
      expect(decodedMessage).toStrictEqual('message');
      expect(type).toStrictEqual(errorDetailType);
    },
  );

  it.each([
    [[status.CANCELLED], ErrorDetailProtobufType.Null],
    [[status.OK], ErrorDetailProtobufType.Null],
    [[status.UNIMPLEMENTED], ErrorDetailProtobufType.Null],
  ])(
    'has empty metadata when code is %d',
    (code: status, errorDetailType: ErrorDetailProtobufType): void => {
      expect.assertions(1);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      const grpcError = new GrpcError(code, 'message', {
        '@type': errorDetailType,
      } as any);
      /* eslint-enable @typescript-eslint/no-explicit-any */
      /* eslint-enable @typescript-eslint/no-unsafe-argument */

      const detailsBin = grpcError.metadata.get('grpc-status-details-bin');

      expect(detailsBin).toHaveLength(0);
    },
  );
});

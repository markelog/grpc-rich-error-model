import { Metadata, status, StatusObject } from '@grpc/grpc-js';
import { grpc } from '@ridedott/run';
import * as serializer from 'proto3-json-serializer';
import { default as protobuf, INamespace } from 'protobufjs';

import type { BadRequest__Output } from './protos/google/rpc/BadRequest';
import type { DebugInfo__Output } from './protos/google/rpc/DebugInfo';
import type { ErrorInfo__Output } from './protos/google/rpc/ErrorInfo';
import type { PreconditionFailure__Output } from './protos/google/rpc/PreconditionFailure';
import type { QuotaFailure__Output } from './protos/google/rpc/QuotaFailure';
import type { ResourceInfo__Output } from './protos/google/rpc/ResourceInfo';
import { assertNever } from './assertions';

import jsonDescriptor from './protos/bundle.json';

// Seems there is an error with the types but it works when casted.
const root = protobuf.Root.fromJSON(jsonDescriptor as INamespace);
export const StatusMessageType = root.lookupType('google.rpc.Status');

export enum ErrorDetailProtobufType {
  BadRequest = 'type.googleapis.com/google.rpc.BadRequest',
  PreconditionFailure = 'type.googleapis.com/google.rpc.PreconditionFailure',
  ErrorInfo = 'type.googleapis.com/google.rpc.ErrorInfo',
  ResourceInfo = 'type.googleapis.com/google.rpc.ResourceInfo',
  QuotaFailure = 'type.googleapis.com/google.rpc.QuotaFailure',
  DebugInfo = 'type.googleapis.com/google.rpc.DebugInfo',
  Null = '@@Null',
}

const mapGrpcErrorToErrorDetailProtobufType = {
  [status.ABORTED]: ErrorDetailProtobufType.ErrorInfo,
  [status.ALREADY_EXISTS]: ErrorDetailProtobufType.ResourceInfo,
  [status.CANCELLED]: ErrorDetailProtobufType.Null,
  [status.DATA_LOSS]: ErrorDetailProtobufType.DebugInfo,
  [status.DEADLINE_EXCEEDED]: ErrorDetailProtobufType.DebugInfo,
  [status.FAILED_PRECONDITION]: ErrorDetailProtobufType.PreconditionFailure,
  [status.INTERNAL]: ErrorDetailProtobufType.DebugInfo,
  [status.INVALID_ARGUMENT]: ErrorDetailProtobufType.BadRequest,
  [status.NOT_FOUND]: ErrorDetailProtobufType.ResourceInfo,
  [status.OK]: ErrorDetailProtobufType.Null,
  [status.OUT_OF_RANGE]: ErrorDetailProtobufType.BadRequest,
  [status.PERMISSION_DENIED]: ErrorDetailProtobufType.ErrorInfo,
  [status.RESOURCE_EXHAUSTED]: ErrorDetailProtobufType.QuotaFailure,
  [status.UNAUTHENTICATED]: ErrorDetailProtobufType.ErrorInfo,
  [status.UNAVAILABLE]: ErrorDetailProtobufType.DebugInfo,
  [status.UNIMPLEMENTED]: ErrorDetailProtobufType.Null,
  [status.UNKNOWN]: ErrorDetailProtobufType.DebugInfo,
};

export interface BadRequest extends BadRequest__Output {
  '@type': ErrorDetailProtobufType.BadRequest;
}
export interface DebugInfo extends DebugInfo__Output {
  '@type': ErrorDetailProtobufType.DebugInfo;
}
export interface PreconditionFailure extends PreconditionFailure__Output {
  '@type': ErrorDetailProtobufType.PreconditionFailure;
}
export interface QuotaFailure extends QuotaFailure__Output {
  '@type': ErrorDetailProtobufType.QuotaFailure;
}
export interface ResourceInfo extends ResourceInfo__Output {
  '@type': ErrorDetailProtobufType.ResourceInfo;
  description: string;
  resourceName: string;
  resourceType: string;
}
export interface ErrorInfo extends ErrorInfo__Output {
  '@type': ErrorDetailProtobufType.ErrorInfo;
  domain: string;
}

interface StatusToErrorDetailType {
  [status.ABORTED]: ErrorInfo;
  [status.ALREADY_EXISTS]: ResourceInfo;
  [status.DATA_LOSS]: DebugInfo;
  [status.DEADLINE_EXCEEDED]: DebugInfo;
  [status.FAILED_PRECONDITION]: PreconditionFailure;
  [status.INTERNAL]: DebugInfo;
  [status.INVALID_ARGUMENT]: BadRequest;
  [status.NOT_FOUND]: ResourceInfo;
  [status.OUT_OF_RANGE]: BadRequest;
  [status.PERMISSION_DENIED]: ErrorInfo;
  [status.RESOURCE_EXHAUSTED]: QuotaFailure;
  [status.UNAUTHENTICATED]: ErrorInfo;
  [status.UNAVAILABLE]: DebugInfo;
  [status.UNKNOWN]: DebugInfo;
}

export type ErrorDetailsForStatus<Status extends status> =
  Status extends keyof StatusToErrorDetailType
    ? StatusToErrorDetailType[Status]
    : never;

export type ErrorDetails =
  | BadRequest
  | DebugInfo
  | ErrorInfo
  | PreconditionFailure
  | QuotaFailure
  | ResourceInfo;

/**
 * Takes the generic error details object, encodes it into a
 * StatusMessageType, creates a buffer from it and sets it
 * the 'grpc-status-details-bin' key of the Metadata.
 */
export const makeMetadataWithEncodedErrorDetails = (
  code: StatusObject['code'],
  message: string,
  errorDetails: ErrorDetails,
): Metadata => {
  const deserializedStatusMessage = serializer.fromProto3JSON(
    StatusMessageType,
    {
      code,
      details: [errorDetails],
      message,
    } as unknown as serializer.JSONValue,
  );

  /* istanbul ignore next */
  if (deserializedStatusMessage === null) {
    return new Metadata();
  }

  const encodedStatusMessage = StatusMessageType.encode(
    deserializedStatusMessage,
  ).finish();
  const buffer = Buffer.from(encodedStatusMessage);

  const metadata = new Metadata();
  metadata.set('grpc-status-details-bin', buffer);

  return metadata;
};

const getErrorMetadataForCode = <Status extends status>(
  code: Status,
  message: string,
  errorDetails: ErrorDetailsForStatus<Status>,
): Metadata => {
  const errorDetailType = mapGrpcErrorToErrorDetailProtobufType[code];

  switch (errorDetailType) {
    case ErrorDetailProtobufType.Null:
      return new Metadata();

    case ErrorDetailProtobufType.BadRequest:
    case ErrorDetailProtobufType.DebugInfo:
    case ErrorDetailProtobufType.PreconditionFailure:
    case ErrorDetailProtobufType.QuotaFailure:
    case ErrorDetailProtobufType.ResourceInfo:
    case ErrorDetailProtobufType.ErrorInfo:
      return makeMetadataWithEncodedErrorDetails(code, message, errorDetails);

    /* istanbul ignore next */
    default:
      assertNever(errorDetailType);
  }
};

export class GrpcError<Status extends StatusObject['code']> extends grpc.Error {
  public override readonly code: StatusObject['code'];

  public override readonly details: string;

  public override readonly metadata: Metadata;

  public constructor(
    code: Status,
    message: string,
    errorDetails: ErrorDetailsForStatus<Status>,
  ) {
    const metadata = getErrorMetadataForCode(code, message, errorDetails);
    super(code, message, { metadata });

    this.code = code;
    this.details = message;
    this.metadata = metadata;
    this.name = 'GrpcError';
  }
}

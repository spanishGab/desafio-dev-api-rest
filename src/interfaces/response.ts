export interface ISuccessResponseBody<ContentType = any> {
  uuid: string;
  message: string;
  content?: ContentType;
}

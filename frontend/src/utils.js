// eslint-disable-next-line import/prefer-default-export
export function CONCAT_SERVER_URL(url) {
  const SERVER_URL = process.env.REACT_APP_BACKEND_URL;
  return url.startsWith(SERVER_URL) ? url : `${SERVER_URL}${url}`;
}

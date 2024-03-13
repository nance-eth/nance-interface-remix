export const getInfuraAuth = (id: string, secret: string) => {
  return `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
}

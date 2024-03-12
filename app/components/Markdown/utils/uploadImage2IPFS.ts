const API = "https://ipfs.infura.io:5001/api/v0";
const gateway = "nance.infura-ipfs.io/ipfs";
// const AUTH_HEADER = `Basic ${Buffer.from("HI"
//   // `${process.env.NEXT_PUBLIC_INFURA_IPFS_ID}:${process.env.NEXT_PUBLIC_INFURA_IPFS_SECRET}`,
// ).toString("base64")}`;

// https://github.com/jbx-protocol/juice-interface/blob/main/src/lib/infura/ipfs.ts
export async function uploadBlob2IPFS(blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob);

  try {
    const response = await fetch(`${API}/add`, {
      method: "POST",
      headers: {
        // Authorization: 'Basic ' + Buffer.from("HI").toString('base64'),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    const cid = data.Hash;
    return `https://${gateway}/${cid}`;
  } catch (error) {
    return Promise.reject(error);
  }
}

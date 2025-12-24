import * as Minio from "minio";

export const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
};

export const BUCKET_NAME = process.env.MINIO_BUCKET || "sim-talenta-gtk";

export const minioClient = new Minio.Client(minioConfig);

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Set bucket policy to allow public read for uploaded files
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

export async function uploadFile(file: Buffer, fileName: string, contentType: string) {
  await ensureBucket();
  await minioClient.putObject(BUCKET_NAME, fileName, file, file.length, {
    "Content-Type": contentType,
  });
  return getFileUrl(fileName);
}

export async function deleteFile(fileName: string) {
  await minioClient.removeObject(BUCKET_NAME, fileName);
}

export async function getPresignedUrl(fileName: string, expiry = 3600) {
  return minioClient.presignedGetObject(BUCKET_NAME, fileName, expiry);
}

export function getFileUrl(fileName: string) {
  const protocol = minioConfig.useSSL ? "https" : "http";
  return `${protocol}://${minioConfig.endPoint}:${minioConfig.port}/${BUCKET_NAME}/${fileName}`;
}

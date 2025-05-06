"use server";
import {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  BlobServiceClient,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_ACCOUNT_NAME || "";
const accountKey = process.env.AZURE_ACCOUNT_KEY || "";
const containerName = process.env.AZURE_CONTAINER_NAME || "";
const interviewContainerName = process.env.AZURE_INTERVIEW_CONTAINER_NAME || "";

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

export const generateSasToken = async (blobName: string) => {
  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("cw"),
    startsOn: new Date(new Date().valueOf() - 1 * 60 * 1000),
    expiresOn: new Date(new Date().valueOf() + 5 * 60 * 1000),
  };

  try {
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();
    // console.log(sasToken);
    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
  } catch (error) {
    console.error("Error generating SAS token:", error);
    return "";
  }
};

export const generateSasUrlForInterview = async () => {
  const sasOptions = {
    containerName: interviewContainerName,
    permissions: BlobSASPermissions.parse("rcw"),
    startsOn: new Date(Date.now() - 10 * 60 * 1000),
    expiresOn: new Date(Date.now() + 60 * 60 * 1000),
  };

  try {
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();
    // console.log("debug for sas token : ",sasToken);
    return {
      sasUrl: `https://${accountName}.blob.core.windows.net/${interviewContainerName}?${sasToken}`,
      sasToken,
    };
  } catch (error) {
    console.error("Error generating SAS token:", error);
    return null;
  }
};


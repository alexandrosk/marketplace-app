import { FormData } from "@remix-run/web-form-data";
import { fetch } from "@remix-run/web-fetch";

const prepareFiles = (files) =>
  files.map((file) => ({
    filename: file.name,
    mimeType: file.type,
    resource: file.type.includes("image") ? "IMAGE" : "FILE",
    fileSize: file.size.toString(),
    httpMethod: "POST",
  }));

const prepareFilesToCreate = (stagedTargets, files, contentType) =>
  stagedTargets.map((stagedTarget, index) => {
    return {
      originalSource: stagedTarget.resourceUrl,
      contentType: files[index].type.includes("image") ? "IMAGE" : "FILE",
      filename: files[index].name,
    };
  });

export const uploadFile = async (files, graphql) => {
  const preparedFiles = prepareFiles(files);

  const result = await graphql(
    `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            resourceUrl
            url
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { input: preparedFiles } },
  );

  const response = await result.json();

  const promises = [];

  files.forEach((file, index) => {
    const url = response.data.stagedUploadsCreate.stagedTargets[index].url;
    const params =
      response.data.stagedUploadsCreate.stagedTargets[index].parameters;
    const formData = new FormData();

    params.forEach((param) => {
      formData.append(param.name, param.value);
    });
    formData.append("file", file);

    const promise = fetch(url, {
      method: "POST",
      body: formData,
    });
    promises.push(promise);
  });

  await Promise.all(promises);

  const fileId = await graphql(
    `
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            ... on MediaImage {
              id
              preview {
                image {
                  url
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        files: prepareFilesToCreate(
          response.data.stagedUploadsCreate.stagedTargets,
          files,
        ),
      },
    },
  );

  const fileIdResponse = await fileId.json();

  return {
    stagedTargets: response.data.stagedUploadsCreate.stagedTargets,
    errors: response.data.stagedUploadsCreate.userErrors,
    files: fileIdResponse.data.fileCreate.files,
  };
};

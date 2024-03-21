import axios from "axios";

const apiClient = axios.create({
  //TODO: change to the hosted backend api domain
  baseURL: "http://localhost:2000",
});

const makeAPICall = async ({
  method = "GET",
  endpoint,
  payload = null,
  params = null,
  contentType = "application/json",
}) => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data: payload,
      params,
      headers: {
        "Content-Type": contentType,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default makeAPICall;
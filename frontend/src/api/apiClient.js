import axios from "axios";

const apiClient = axios.create({
  //TODO: change to the hosted backend api domain
  baseURL: process.env.REACT_APP_COMMPASS_URL || "http://127.0.0.1:8000",
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

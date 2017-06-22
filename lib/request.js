require("dotenv").config();
import fetch from "node-fetch";
import moment from "moment";
import _ from "lodash";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

export default function(path) {
  const params = {
    headers: {
      ...DEFAULT_HEADERS
    }
  };

  const response = fetch(`${process.env.NOAA_URL}${path}`, params);

  response.catch(() => {
    Alert.alert(
      "Cannot complete request",
      "We were uable fetch tide information.",
      [{ text: "OK" }]
    );
  });

  return response.then(res => {
    if (res.ok) {
      return res.json();
    } else {
      return res.json().then(json => Promise.reject(json));
    }
  });
}

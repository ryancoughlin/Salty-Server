import SwellHeight from "../swell-height";

const swellRoute = {
  method: "GET",
  path: "/api/swell",
  handler: function(
    { query: { latitude: latitude, longitude: longitude } },
    reply
  ) {
    const swellHeight = new SwellHeight(latitude, longitude);

    return swellHeight
      .fetchSwellHeights()
      .then(heights => {
        reply(heights);
      })
      .catch(error => {
        console.log("ERROR:", error);
        reply({});
      });
  }
};

export default swellRoute;

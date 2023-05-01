import { formatSwellData, groupByDay } from "../swells";
import request from "../request";
import { findMSWSpot } from "../find-msw-spot";

const swellController = () => {
  const getSwell = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query;
      const swells = await findMSWSpot(latitude, longitude).then((spot) => {
        console.log(spot);
        const spotId = spot.spotId;
        const url = new URL(
          `https://magicseaweed.com/api/${process.env.MSW_KEY}/forecast?spot_id=${spotId}&fields=timestamp,swell.*,wind.*`
        );

        return request(url)
          .then((json) => {
            return formatSwellData(json);
          })
          .catch((error) => {
            console.log("Error requesting high/low tides", error.message);
          });
      });
      return res.status(200).json(swells);
    } catch (error) {
      return res.status(500).json({ message: `${JSON.stringify(error)}` });
    }
  };

  return {
    getSwell,
  };
};

module.exports = swellController;

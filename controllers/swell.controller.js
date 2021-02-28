import swell from "../swells";

const swellController = () => {
  const getSwell = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query;
      const swells = await swell
        .fetchSwellHeight(latitude, longitude)
        .catch((error) => console.error(error));
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

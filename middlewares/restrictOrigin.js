const allowedOrigins = ["localhost"]; //list of allowed domains

module.exports = (req, res, next) => {
  
  let isDomainAllowed = allowedOrigins.indexOf(req.hostname) !== -1;

  if (!isDomainAllowed) 
	return res.status(403).json({
	  message: "Access Restricted" 
	});
  
  next();
};
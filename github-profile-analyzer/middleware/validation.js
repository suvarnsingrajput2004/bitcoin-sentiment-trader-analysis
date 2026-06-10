/**
 * Middleware for validating incoming request parameters.
 */

// GitHub usernames: max 39 characters, alphanumeric and hyphens (-), no consecutive hyphens, cannot start or end with hyphen
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * Validates github username parameter.
 */
function validateUsername(req, res, next) {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Username parameter is required.',
        status: 400
      }
    });
  }

  if (!GITHUB_USERNAME_REGEX.test(username)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid GitHub username. Usernames may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.",
        status: 400
      }
    });
  }

  next();
}

/**
 * Validates database ID parameter.
 */
function validateId(req, res, next) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid ID. Must be a positive integer.',
        status: 400
      }
    });
  }

  next();
}

/**
 * Validates and sanitizes pagination and query filters.
 */
function validatePagination(req, res, next) {
  let { page, limit } = req.query;

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Page query parameter must be a positive integer.',
          status: 400
        }
      });
    }
    req.query.page = parsedPage;
  } else {
    req.query.page = 1;
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Limit query parameter must be a positive integer and cannot exceed 100.',
          status: 400
        }
      });
    }
    req.query.limit = parsedLimit;
  } else {
    req.query.limit = 10;
  }

  next();
}

module.exports = {
  validateUsername,
  validateId,
  validatePagination
};

const gitHubService = require('../services/githubService');
const profileModel = require('../models/profileModel');

class ProfileController {
  /**
   * GET /api/analyze/:username
   * Fetch GitHub details, calculate insights, and store/update in MySQL.
   */
  async analyzeProfile(req, res, next) {
    try {
      const { username } = req.params;

      // Fetch from GitHub API and analyze
      const analyzedData = await gitHubService.analyzeProfile(username);

      // Upsert into MySQL database
      const dbProfile = await profileModel.upsert(analyzedData);

      return res.status(200).json({
        success: true,
        message: `GitHub profile for '${username}' has been successfully analyzed and stored.`,
        data: dbProfile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profiles
   * Get all stored profiles with optional search and pagination.
   */
  async getProfiles(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const offset = (page - 1) * limit;

      const { profiles, total } = await profileModel.getAll({ limit, offset, search });
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: profiles,
        pagination: {
          total_records: total,
          current_page: page,
          limit: limit,
          total_pages: totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profiles/:id
   * Get single analyzed profile by database ID.
   */
  async getProfileById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const profile = await profileModel.findById(id);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Profile with ID ${id} not found.`,
            status: 404
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profiles/username/:username
   * Get single analyzed profile by GitHub username.
   */
  async getProfileByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const profile = await profileModel.findByUsername(username);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Profile with username '${username}' not found.`,
            status: 404
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/profiles/:id
   * Delete analyzed profile by database ID.
   */
  async deleteProfile(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const profileExists = await profileModel.findById(id);

      if (!profileExists) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Profile with ID ${id} not found.`,
            status: 404
          }
        });
      }

      await profileModel.deleteById(id);

      return res.status(200).json({
        success: true,
        message: `Profile with ID ${id} successfully deleted.`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();

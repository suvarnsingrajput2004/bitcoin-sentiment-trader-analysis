const { pool } = require('../config/db');

class ProfileModel {
  /**
   * Save or update profile data in the database.
   * @param {Object} data - Profile and insight data
   * @returns {Promise<Object>} The upserted profile database record
   */
  async upsert(data) {
    const query = `
      INSERT INTO github_profiles (
        username, name, bio, avatar_url, profile_url, public_repos, followers, following,
        created_at, updated_at, account_age_years, total_repositories, total_stars,
        total_forks, most_starred_repository, most_used_programming_language, average_stars_per_repository
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        avatar_url = VALUES(avatar_url),
        profile_url = VALUES(profile_url),
        public_repos = VALUES(public_repos),
        followers = VALUES(followers),
        following = VALUES(following),
        created_at = VALUES(created_at),
        updated_at = VALUES(updated_at),
        account_age_years = VALUES(account_age_years),
        total_repositories = VALUES(total_repositories),
        total_stars = VALUES(total_stars),
        total_forks = VALUES(total_forks),
        most_starred_repository = VALUES(most_starred_repository),
        most_used_programming_language = VALUES(most_used_programming_language),
        average_stars_per_repository = VALUES(average_stars_per_repository),
        analyzed_at = CURRENT_TIMESTAMP
    `;

    // Convert ISO date strings to MySQL friendly datetime strings
    const formattedCreatedAt = data.created_at ? new Date(data.created_at).toISOString().slice(0, 19).replace('T', ' ') : null;
    const formattedUpdatedAt = data.updated_at ? new Date(data.updated_at).toISOString().slice(0, 19).replace('T', ' ') : null;

    const values = [
      data.username,
      data.name,
      data.bio,
      data.avatar_url,
      data.profile_url,
      data.public_repos,
      data.followers,
      data.following,
      formattedCreatedAt,
      formattedUpdatedAt,
      data.account_age_years,
      data.total_repositories,
      data.total_stars,
      data.total_forks,
      data.most_starred_repository,
      data.most_used_programming_language,
      data.average_stars_per_repository
    ];

    await pool.query(query, values);
    return this.findByUsername(data.username);
  }

  /**
   * Get profile by username.
   * @param {string} username
   * @returns {Promise<Object|null>} Profile record or null
   */
  async findByUsername(username) {
    const query = 'SELECT * FROM github_profiles WHERE username = ?';
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get profile by database ID.
   * @param {number} id
   * @returns {Promise<Object|null>} Profile record or null
   */
  async findById(id) {
    const query = 'SELECT * FROM github_profiles WHERE id = ?';
    const [rows] = await pool.query(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Retrieve all profiles with pagination and optional search filter.
   * @param {Object} params
   * @param {number} params.limit
   * @param {number} params.offset
   * @param {string} [params.search]
   * @returns {Promise<{ profiles: Array, total: number }>}
   */
  async getAll({ limit, offset, search }) {
    let selectQuery = 'SELECT * FROM github_profiles';
    let countQuery = 'SELECT COUNT(*) as count FROM github_profiles';
    const queryParams = [];
    const countParams = [];

    if (search) {
      const filter = ' WHERE username LIKE ? OR name LIKE ?';
      const searchPattern = `%${search}%`;
      selectQuery += filter;
      countQuery += filter;
      queryParams.push(searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern);
    }

    selectQuery += ' ORDER BY analyzed_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [rows] = await pool.query(selectQuery, queryParams);
    const [countRows] = await pool.query(countQuery, countParams);

    return {
      profiles: rows,
      total: countRows[0].count
    };
  }

  /**
   * Delete a profile from the database by ID.
   * @param {number} id
   * @returns {Promise<boolean>} True if a record was deleted, false otherwise
   */
  async deleteById(id) {
    const query = 'DELETE FROM github_profiles WHERE id = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProfileModel();

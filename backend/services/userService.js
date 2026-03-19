const { dbGet, dbAll, dbRun } = require('../db/database');

class UserService {
  async getUserById(id) {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return null;
    if (user.ai_style_tags) {
      try { user.ai_style_tags = JSON.parse(user.ai_style_tags); } catch {}
    }
    if (user.saved_themes) {
      try { user.saved_themes = JSON.parse(user.saved_themes); } catch { user.saved_themes = []; }
    }
    return user;
  }

  async updateUserProfile(id, data) {
    const { name, bio, location, website, instagram, avatar_url, preset, saved_themes } = data;
    const savedThemesStr = Array.isArray(saved_themes) ? JSON.stringify(saved_themes) : undefined;
    
    await dbRun(
      `UPDATE users SET name=COALESCE(?,name),bio=COALESCE(?,bio),
       location=COALESCE(?,location),website=COALESCE(?,website),
       instagram=COALESCE(?,instagram),avatar_url=COALESCE(?,avatar_url),
       preset=COALESCE(?,preset), saved_themes=COALESCE(?,saved_themes), updated_at=datetime('now') WHERE id=?`,
      [name, bio, location, website, instagram, avatar_url, preset, savedThemesStr, id]
    );
    return this.getUserById(id);
  }

  async getAllUsersAdmin() {
    return await dbAll(`
      SELECT u.id, u.email, u.name, u.role, u.created_at, COUNT(a.id) as artwork_count
      FROM users u
      LEFT JOIN artworks a ON a.artist_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
  }

  async updateUserRole(id, role) {
    return await dbRun('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  }

  async getAdminStats() {
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users');
    const totalArtists = await dbGet("SELECT COUNT(*) as count FROM users WHERE role = 'artist'");
    return {
      totalUsers: totalUsers.count,
      totalArtists: totalArtists.count
    };
  }
}

module.exports = new UserService();

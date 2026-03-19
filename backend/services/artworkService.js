const { dbGet, dbAll, dbRun } = require('../db/database');

class ArtworkService {
  async getArtworksByArtist(artistId) {
    return await dbAll('SELECT * FROM artworks WHERE artist_id = ? ORDER BY created_at DESC', [artistId]);
  }

  async getArtworkByIdAndArtist(artworkId, artistId) {
    return await dbGet('SELECT * FROM artworks WHERE id = ? AND artist_id = ?', [artworkId, artistId]);
  }
  
  async getArtworkById(id) {
    return await dbGet('SELECT * FROM artworks WHERE id = ?', [id]);
  }

  async createArtwork(artistId, data) {
    const { title, medium, style, description, price, available, image_url, year, dimensions } = data;
    const r = await dbRun(
      `INSERT INTO artworks (artist_id,title,medium,style,description,price,available,image_url,year,dimensions)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [artistId, title, medium, style, description, parseFloat(price), available !== false ? 1 : 0, image_url, year, dimensions]
    );
    return this.getArtworkById(r.lastID);
  }

  async updateArtwork(artworkId, artistId, data) {
    const { title, medium, style, description, price, available, image_url, year, dimensions } = data;
    await dbRun(
      `UPDATE artworks SET title=COALESCE(?,title),medium=COALESCE(?,medium),style=COALESCE(?,style),
       description=COALESCE(?,description),price=COALESCE(?,price),available=COALESCE(?,available),
       image_url=COALESCE(?,image_url),year=COALESCE(?,year),dimensions=COALESCE(?,dimensions)
       WHERE id = ? AND artist_id = ?`,
      [title, medium, style, description, price != null ? parseFloat(price) : null,
       available != null ? (available ? 1 : 0) : null, image_url, year, dimensions,
       artworkId, artistId]
    );
    return this.getArtworkById(artworkId);
  }

  async deleteArtwork(artworkId, artistId) {
    return await dbRun('DELETE FROM artworks WHERE id = ? AND artist_id = ?', [artworkId, artistId]);
  }

  async deleteArtworkAdmin(artworkId) {
    return await dbRun('DELETE FROM artworks WHERE id = ?', [artworkId]);
  }

  async getArtistStats(artistId) {
    const count = await dbGet('SELECT COUNT(*) as count FROM artworks WHERE artist_id = ?', [artistId]);
    const views = await dbGet('SELECT SUM(view_count) as total FROM artworks WHERE artist_id = ?', [artistId]);
    const avail = await dbGet('SELECT COUNT(*) as count FROM artworks WHERE artist_id = ? AND available = 1', [artistId]);
    return {
      artworks: count.count,
      views: views.total || 0,
      available: avail.count,
      sold: count.count - avail.count
    };
  }

  async getAllArtworksAdmin() {
    return await dbAll(`
      SELECT a.id, a.title, a.artist_id, a.price, a.available, a.created_at, u.name as artist_name
      FROM artworks a
      JOIN users u ON u.id = a.artist_id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
  }

  async getAdminStats() {
    const totalArtworks = await dbGet('SELECT COUNT(*) as count FROM artworks');
    const soldArtworks = await dbGet('SELECT COUNT(*) as count FROM artworks WHERE available = 0');
    const totalRevenue = await dbGet('SELECT SUM(price) as total FROM artworks WHERE available = 0');
    return {
      artworks: totalArtworks.count,
      sold: soldArtworks.count,
      revenue: totalRevenue.total || 0
    };
  }
}

module.exports = new ArtworkService();

const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistsById(id) {
    const query = {
      text:
        `SELECT playlists.id, playlists.name, users.username FROM playlists
        INNER JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    const id = `playlistSongs-${nanoid(16)}`;

    const querySongId = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const resultSongId = await this._pool.query(querySongId);

    if (!resultSongId.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this.addPlaylistActivity({
      playlistId, songId, userId, action: 'add',
    });

    return result.rows[0].id;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.*, users.username, songs.id as song_id, songs.title as song_title, songs.performer FROM playlists
      LEFT JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
      LEFT JOIN songs ON songs.id = playlistsongs.song_id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }

    const songs = result.rows.map((row) => ({
      id: row.song_id,
      title: row.song_title,
      performer: row.performer,
    }));

    const playlstResult = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      songs,
    };

    return playlstResult;
  }

  async deletePlaylistSong(songId, playlistId, userId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id =$2 RETURNING id',
      values: [songId, playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song id tidak ditemukan');
    }

    await this.addPlaylistActivity({
      playlistId, songId, userId, action: 'delete',
    });
  }

  async addPlaylistActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `playlistSongActivity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getActivityByPlaylistId({ id }) {
    const query = {
      text: `SELECT u.username, s.title, psa.action, psa.time FROM playlist_song_activities psa 
      LEFT JOIN users u ON psa.user_id = u.id
      LEFT JOIN songs s ON psa.song_id = s.id 
      WHERE psa.playlist_id = $1 ORDER BY psa.time ASC`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Activity tidak ditemukan');
    }
    return result.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;

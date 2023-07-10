/* eslint-disable camelcase */

const mapDBToAlbumsService = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBToSongsService = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToAlbumSongService = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = { mapDBToAlbumsService, mapDBToSongsService, mapDBToAlbumSongService };

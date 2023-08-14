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
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
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

module.exports = {
  mapDBToAlbumsService,
  mapDBToSongsService,
  mapDBToAlbumSongService,
};

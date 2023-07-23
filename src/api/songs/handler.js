class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const songId = await this._service.addSong(request.payload);

    return h.response({
      status: 'success',
      message: 'Menambahkan lagu',
      data: {
        songId,
      },
    }).code(201);
  }

  async getSongsHandler(request) {
    const queryParams = request.query;

    const songs = await this._service.getSongs(queryParams);

    return {
      status: 'success',
      message: 'Mendapatkan seluruh lagu',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      message: 'Mendapatkan lagu berdasarkan id',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    await this._service.editSongById(id, {
      title, year, genre, performer, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Mengubah lagu berdasarkan id',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Menghapus lagu berdasarkan id',
    };
  }
}

module.exports = SongsHandler;

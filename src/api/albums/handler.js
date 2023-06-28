class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = this._service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      message: 'Menambahkan album',
      data: {
        albumId,
      },
    }).code(201);
  }

  getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;

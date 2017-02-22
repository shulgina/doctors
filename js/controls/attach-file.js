"use strict";

if (window.Controls === undefined) {
    window.Controls = {};
}

window.Controls.AttachFile = function ($attachFileButton, $attachForm, reciever) {

    var $m_attach_file_button = $attachFileButton;
    var $m_attach_form = $attachForm;
    var m_reciever = reciever || {
            start: null,
            success: null,
            error: null,
            xhr: null,
            complete: null
        };
    var $m_dropdown_list = $m_attach_file_button.parents('form').find('.dropdown-list');
    var $m_attachment_document_modal = $('#attachmentDocument');

    var Init = function () {
        var $attachment_file = $m_attach_form.find('.attachmentFile');
        var url = $m_attach_form.attr('action');

        $m_attach_file_button.click(function (e) {
            e.preventDefault();

            if ($(this).hasClass('sending')) {
                return;
            }

            if ($(this).hasClass('chat-attachment') && !$(this).parents('body').hasClass('doctor')) {
                $m_dropdown_list.toggleClass('opened');
                $('body').click(function (e) {
                    if(!$(e.target).closest('.chat-attachment').length) {
                        $m_dropdown_list.removeClass('opened');
                    }
                });
            } else {
                $attachment_file.click();
                $m_attachment_document_modal.modal('hide');
            }
        });

        $m_dropdown_list.find('.open-file').click(function () {
            $attachment_file.click();
        });

        $m_dropdown_list.find('.open-documents').click(function () {

            var $doc_wrapper = $m_attachment_document_modal.find('.documents-wrapper');

            if($doc_wrapper.find('.document-item').length) {
                $m_attachment_document_modal.modal('show');
                return;
            }

            // Достаем загруженные документы
            $.ajax({
                url: '/mobile/user/documents/list/',
                method: 'POST',
                data: {
                    start: 0,
                    limit: 12
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 'OK') {

                        if (data.data.length) {
                            $m_attachment_document_modal.find('.no-documents').hide();

                            for (var i in data.data) {
                                var doc = data.data[i];
                                var not_image_class = '';
                                if (!doc.is_image) {
                                    not_image_class = ' not-image';
                                }

                                var dateParts = Helper.Time.getDateParts(doc.filemtime);
                                var uploadTime = dateParts.d + '.' + dateParts.m + '.' + dateParts.Y;

                                $doc_wrapper
                                    .append('<div class="document-item" data-id="'+doc.id+'">\
                                            <div class="thumb-wrapper' + not_image_class + '"><img src="/mobile/user/get_request_attachment/?id=' + doc.id + '&size=avatar">\
                                            <div class="attach-document button-style btn-3 small-button">Отправить</div>\
                                            <div class="unselect"></div></div>\
                                            <div class="filename">' + doc.user_filename + '</div>\
                                            <div class="upload-date">Дата загрузки: ' + uploadTime + '</div>\
                                            </div>');
                            }

                            InitAttachButton();

                            InitRequestAttachment();
                        }

                    } else {
                        console.log(data['errors']);
                    }
                },
                error: function (e) {
                    console.log(e);
                },
                complete: function () {
                    $m_attachment_document_modal.modal('show');
                }
            });
        });

        var InitAttachButton = function () {
            $m_attachment_document_modal.find('.document-item').click(function (e) {
                if(e.target.className != 'unselect') {
                    $(this).addClass('selected').siblings('.selected').removeClass('selected');
                } else {
                    $(this).removeClass('selected');
                }
            });
        };

        var InitRequestAttachment = function () {
            $m_attachment_document_modal.find('.attach-document').click(function () {
                var $this = $(this);
                var $document = $this.parents('.document-item');
                var active_request_id = $m_attach_form.find('.request_id').val();
                var file_id = $document.data('id');

                if($this.hasClass('sending')) {
                    return;
                }

                $this.addClass('sending');

                $.ajax({
                    url: '/mobile/user/add_request_attachment/',
                    method: 'POST',
                    data: {
                        request_id: active_request_id,
                        file_id: file_id,
                        description: ''
                    },
                    dataType: 'json',
                    success: function (data) {
                        if(data.status !== 'OK') {
                            switch (data['errors']) {
                                case g_errorConstants['UNRECOGNIZED_IMAGE_FORMAT']:
                                    PopupError('Загрузка не удалась, неверный формат файла.');
                                    break;
                                case g_errorConstants['INVALID_FILE_SIZE']:
                                    PopupError('Отослать не удалось, размер файла слишком большой.');
                                    break;
                                case g_errorConstants['TOO_SOON_TO_ANSWER']:
                                    PopupError('Вы не можете прикрепить файл, до начала консультации еще более 10 минут.');
                                    break;
                                case g_errorConstants['ERROR_WITH_MESSAGE']:
                                case g_errorConstants['REQUEST_CLOSED']:
                                    PopupError(data.message);
                                    break;
                                default :
                                    console.log(data['errors']);
                            }
                        }

                        $m_attachment_document_modal.modal('hide');
                    },
                    error: function (error) {
                        console.log(error);
                    },
                    complete: function () {
                        $document.removeClass('selected');
                        $this.removeClass('sending');
                    }
                });
            });
        };

        $m_attach_form.submit(function (e) {
            e.preventDefault();

            $m_attach_file_button.addClass('sending');

            if (m_reciever.start) {
                m_reciever.start();
            }

            $.ajax({
                url: url,
                method: 'POST',
                data: new FormData($(this)[0]),
                dataType: 'json',
                xhr: function () {  // Custom XMLHttpRequest
                    var myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) { // Check if upload property exists
                        myXhr.upload.addEventListener('progress', function (oEvent) {
                            if (oEvent.lengthComputable) {
                                if (m_reciever.xhr) {
                                    m_reciever.xhr(oEvent.loaded / oEvent.total * 100);
                                }
                            }
                        }, false);
                    }
                    return myXhr;
                },
                success: function (data) {
                    if (data['status'] !== 'OK') {
                        switch (data['errors']) {
                            case g_errorConstants['UNRECOGNIZED_IMAGE_FORMAT']:
                                PopupError('Загрузка не удалась, неверный формат файла.');
                                break;
                            case g_errorConstants['INVALID_FILE_SIZE']:
                                PopupError('Отослать не удалось, размер файла слишком большой.');
                                break;
                            case g_errorConstants['TOO_SOON_TO_ANSWER']:
                                PopupError('Вы не можете прикрепить файл, до начала консультации еще более 10 минут.');
                                break;
                            case g_errorConstants['ERROR_WITH_MESSAGE']:
                            case g_errorConstants['REQUEST_CLOSED']:
                                PopupError(data.message);
                                break;
                            default :
                                console.log(data['errors']);
                        }
                    } else if (m_reciever.success) {
                        m_reciever.success(data);
                    }
                },
                error: function (er) {
                    if (m_reciever.error) {
                        m_reciever.error(er);
                    }

                    if (er.status == 413) {
                        PopupError('Отослать не удалось, размер файла слишком большой.');
                    } else {
                        PopupError('Во время загрузки файла произошла неизвестная ошибка. Обратитесь к администрации сайта.');
                    }
                },
                complete: function () {
                    if (m_reciever.complete) {
                        m_reciever.complete();
                    }

                    $m_attach_file_button.removeClass('inactive sending');
                },
                cache: false,
                contentType: false,
                processData: false
            });
        });

        $attachment_file.change(function () {
            $m_attach_form.submit();
        });

        $('.my-documents').scroll(function () {
            var $this = $(this);
            var scrollHeight = $this[0].scrollHeight;
            var windowHeigh = $this.innerHeight();
            var scrollTop = $this.scrollTop();

            var documentsCount = $this.find('.document-item').length;

            if(scrollHeight - windowHeigh <= scrollTop) {
                LoadDocuments(documentsCount);
            }

        });

        var docsLoading = 0;
        var hasDocuments = 1;

        var LoadDocuments = function(start) {
            if(start >= 0 && hasDocuments && !docsLoading) {
                docsLoading = 1;

                var $doc_wrapper = $m_attachment_document_modal.find('.documents-wrapper');
                var $loader = $m_attachment_document_modal.find('.loader');

                $doc_wrapper.addClass('fade');
                $loader.fadeIn();

                $.ajax({
                    url: '/mobile/user/documents/list/',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        start: start,
                        limit: 12
                    },
                    success: function (resp) {
                        if(resp.status === 'OK') {
                            if(resp.data.length > 0 && resp.data.length <= 12) {
                                for(var i in resp.data) {
                                    var item = resp.data[i];
                                    var not_image_class = '';
                                    var dateParts = Helper.Time.getDateParts(item.filemtime);
                                    var uploadTime = dateParts.d + '.' + dateParts.m + '.' + dateParts.Y;

                                    if(!item.is_image) {
                                        not_image_class = ' not-image';
                                    }

                                    var content = '<div class="document-item" data-id="'+item.id+'">' +
                                                  '<div class="thumb-wrapper' + not_image_class + '"><img src="/mobile/user/get_request_attachment/?id=' + item.id + '&size=avatar">' +
                                                  '<div class="attach-document button-style btn-3 small-button">Отправить</div>' +
                                                  '<div class="unselect"></div></div>' +
                                                  '<div class="filename">' + item.user_filename + '</div>' +
                                                  '<div class="upload-date">Дата загрузки: ' + uploadTime + '</div>' +
                                                  '</div>';

                                    $doc_wrapper.append(content);

                                    InitAttachButton();
                                    InitRequestAttachment();
                                }
                            } else {
                                hasDocuments = 0;
                            }
                        }
                    },
                    error: function () {
                        PopupError('Ошибка соединения с сервером');
                    },
                    complete: function () {
                        docsLoading = 0;
                        $loader.fadeOut();
                        $doc_wrapper.removeClass('fade');
                    }
                });
            }
        }
    };

    Init();
};
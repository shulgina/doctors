"use strict";

if (window.Helper === undefined) {
    window.Helper = {};
}

Helper.User = {
    fullName: function (user) {
        var result = user.last_name + ' ';
        if (user.middle_name) {
            result += user.middle_name + ' ';
        }
        result += user.first_name + ' ';
        return result;
    },
    profileUrl: function(id) {
        return '/doctors/?id=' + id;
    },
    avatarUrl: function(id) {
        return '/mobile/user/userpic/' + id + '/thumb/';
    },
    professions: function(data) {
        var professions = [];
        if (data.main_profession) {
            professions.push(data.main_profession);
        }

        $.each(data.professions, function() {
            professions.push(this.name);
        });

        return professions.join(', ');
    }
};
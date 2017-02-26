"use strict";

var WebSocketLocalConstructor = function () {
    var m_me = this;

    m_me.Socket = null,
        m_me.CommandsHistory = {},
        m_me.SessionId = null,
        m_me.Host = null,
        m_me.Connecting = function () {
        };
    m_me.Connected = function () {
    };
    m_me.Disconnecting = function () {
    };
    m_me.Disconnected = function () {
        console.log('Disconnected')
        window.setTimeout("WebSocketLocal.RequestCommand('/mobile/user/online_status/', null, null);", 30000);
    };
    m_me.Error = function (error) {
    };
    m_me.CommandRequestComplete = function (command) {
    };
    m_me.CommandResultReceived = function (data) {
        if (data['result']['status'] != 'OK') {
            console.log(data);
            return;
        }
    };
    m_me.EventReceived = function (event) {
    };
    m_me.Connect = function () {
        try {
            this.InitSocket(this);
        }
        catch (ex) {
            return ex;
        }
        return true;
    };
    m_me.Disconnect = function () {
        var me = this;

        me.Disconnecting();
        try {
            if (me.Socket !== null) {
                me.Socket.close();
                me.Socket = null;
            }
        }
        catch (ex) {
            return ex;
        }

        me.Disconnected();
        return true;
    };
    m_me.RequestCommand = function (name, params, time_offset) {
        var me = this;

        if (typeof (time_offset) === 'undefined') {
            time_offset = 0;
        }

        if (typeof (params) === 'undefined') {
            params = null;
        }

        if (me.Socket !== null
            && me.Socket.readyState !== 1) {
            me.Socket.close();
            me.Socket = null;
        }

        if (me.Socket === null) {
            me.InitSocket(me.RequestCommandInternal, name, params, time_offset);
            return;
        }

        me.RequestCommandInternal(name, params, time_offset);
    };
    m_me.InitSocket = function (callback_on_connect, arg_name, arg_arguments, arg_time_offset) {
        var me = this;
        try {
            if (me.Socket !== null) {
                var socketStatus = me.Disconnect();
                if (socketStatus !== true) {
                    return socketStatus;
                }
            }
            me.Connecting();
            me.Socket = new WebSocket(me.Host);

            me.Socket.onopen = function () {
                if (this.readyState === 1) {
                    me.Connected('Websocket connected - status:' + this.readyState);
                    if (callback_on_connect !== null &&
                        typeof callback_on_connect === 'function') {
                        callback_on_connect.call(me, arg_name, arg_arguments, arg_time_offset);
                    }
                } else {
                    me.Error('Websocket connection error - status:' + this.readyState);
                    me.Disconnect();
                }
            };
            me.Socket.onmessage = function (msg) {
                try {
                    var packet = me.ParseResponsePacket(msg.data);
                }
                catch (ex) {
                    me.Error(ex);
                }
                if (packet['type'] == 'event') {
                    me.EventReceived(packet['data']);
                }
            };
            me.Socket.onclose = function () {
                me.Disconnected();
            };
        }
        catch (ex) {
            me.Error(ex);
        }
    };
    m_me.RequestCommandInternal = function (name, params, time_offset) {
        var me = this;

        function GenerateGuid() {
            function _p8(s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            }

            return _p8() + _p8(true) + _p8(true) + _p8();
        };

        var packet = {};
        packet['type'] = "command";
        packet['session_id'] = me.SessionId;
        packet['data'] = {};
        packet['data']['name'] = name;

        // store the unique id of the command in the params list which will be returned back to the client
        if (params === null
            || typeof (params) === 'undefined') {
            params = {};
        }
        params['client_command_id'] = GenerateGuid();
        packet['data']['arguments'] = params;
        packet['data']['time_offset'] = time_offset;

        var jsonCommand = JSON.stringify(packet);
        me.CommandsHistory[params['client_command_id']] = packet;
        me.Socket.send(jsonCommand);

        me.CommandRequestComplete(packet);
    };
    m_me.ParseResponsePacket = function (jsonEvent) {
        var me = this;

        var packet = JSON.parse(jsonEvent);

        if (packet === null
            || typeof packet === 'undefined') {
            throw "invalid_packet_recieved";
        }
        if (!('type' in packet)) {
            throw "no_packet_type_recieved";
        }

        if (packet['type'] !== 'response'
            && packet['type'] !== 'event'
            && packet['type'] !== 'command_result') {
            throw "invalid_packet_type_recieved; " + packet['type'];
        }
        
        if (packet['data'] === null
            || typeof packet['data'] === 'undefined') {
            throw "undefined_packet_data_received";
        }

        /*  if (packet['type'] === 'command_result') {
            delete packet['type'];

            if (packet['data']['result'] === null
                || typeof packet['data']['result'] === 'undefined') {
                throw "undefined_command_result_received";
            }

            if (packet['data']['result'] === null
                && typeof packet['data']['result'] === 'undefined') {
                throw "invalid_command_result_received";
            }

            var objToRetrun = {};
            objToRetrun = packet['data'];

            //delete this.CommandsHistory[data['client_command_id']];
            me.CommandResultReceived(objToRetrun);
        } else */
        
        return {
            type: packet['type'],
            data: packet['data']
        };
    };
};

var WebSocketLocal = new WebSocketLocalConstructor();
WebSocketLocal.Host = webSocketHost;
WebSocketLocal.SessionId = GetCookie('PHPSESSID');

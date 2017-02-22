function SendGALogin() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'authorization', 'click', 'enter');
        ga('send', 'pageview', 'virtual/authorization');
    }
}

function SendGARegisterInitiation() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'registration', 'click', 'registration initiation');
        ga('send', 'pageview', 'virtual/register/initiate');
    }
}

function SendGARegister() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'registration', 'click', 'registration start');
        ga('send', 'pageview', 'virtual/register/form');
    }
}

function SendGAOneStepRegister() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'registration', 'click', 'registration start');
        ga('send', 'pageview', 'virtual/register/form');
        ga('send', 'pageview', 'virtual/register/form_1step');
    }
}

function SendGAMobileConfirm() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'registration', 'click', 'registration confirm');
        ga('send', 'pageview', 'virtual/register/confirm');
    }
}

function SendGAStartConsultation() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'consultation', 'click', 'start consultation');
        ga('send', 'pageview', 'virtual/start_consultation');
    }
}

function SendGASelectDoctor() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'doctor', 'click', 'select doctor');
        ga('send', 'pageview', 'virtual/select_doctor');
    }
}

function SendGAConsultationCreated() {
    if (typeof ga !== 'undefined') {
        ga('send', 'event', 'consultation_fact', 'click', 'initiated');
        ga('send', 'pageview', 'virtual/consultation_fact/initiated');
    }
}

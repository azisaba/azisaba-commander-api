create table logs
(
    `id`        int     auto_increment,
    `user_id`   int     null,
    `message`   TEXT    null,
    `date`      DATETIME default CURRENT_TIMESTAMP null,
    constraint logs_pk
        primary key (`id`)
);
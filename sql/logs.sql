create table logs
(
    `id`            int auto_increment,
    `user_id`       int             null,
    `area`          varchar(255)    null,
    `action`        varchar(255)    null,
    `description`   varchar(512)    null,
    `date`          DATETIME default CURRENT_TIMESTAMP null,
    constraint logs_pk
        primary key (`id`)
);
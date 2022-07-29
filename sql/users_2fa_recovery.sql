create table users_2fa_recovery
(
    `id`            int auto_increment,
    `user_id`       int          not null,
    `code`          varchar(20)          not null,
    `used`          tinyint(1)   not null default 0,
    constraint users_2fa_recovery_pk
        primary key (`id`)
);
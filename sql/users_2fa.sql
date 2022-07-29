create table users_2fa
(
    `id`            int auto_increment,
    `user_id`       int          not null,
    `secret_key`    varchar(255) not null,
    constraint users_2fa_pk
        primary key (`id`)
);
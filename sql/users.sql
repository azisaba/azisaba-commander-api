create table users
(
    `id`            int auto_increment,
    `username`      varchar(64)  not null,
    `password`      varchar(255) not null,
    `group`         varchar(64)  not null,
    `ip`            varchar(255) not null,
    `last_update`   DATETIME     not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    constraint users_pk
        primary key (id)
);
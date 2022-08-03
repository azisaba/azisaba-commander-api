create table permissions
(
    `id`        int auto_increment,
    `name`      varchar(255) not null,
    `content`   text         not null,
    constraint permissions_pk
        primary key (`id`)
);
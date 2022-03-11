create table permissions
(
    `id`        int auto_increment,
    `name`      varchar(255) not null,
    `project`   varchar(255) not null,
    `service`   varchar(255) not null,
    constraint permissions_pk
        primary key (id)
);
create table logs
(
    id          int auto_increment,
    user_id     int             not null,
    area        varchar(255)    not null,
    action      varchar(255)    not null,
    description varchar(512)    not null,
    date        DATETIME default CURRENT_TIMESTAMP null,
    constraint logs_pk
        primary key (id)
);
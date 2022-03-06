create table permissions
(
    id          int auto_increment,
    name        varchar(255) not null,
    target_name varchar(255) not null,
    constraint permissions_pk
        primary key (id)
);
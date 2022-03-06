create table users_permission
(
    id            int auto_increment,
    user_id       int not null,
    permission_id int not null,
    constraint users_permission_pk
        primary key (id)
);
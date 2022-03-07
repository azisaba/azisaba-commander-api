create table sessions
(
    state      varchar(255) not null,
    expires_at bigint       not null,
    user_id    int          not null,
    ip         varchar(255) not null,
    constraint sessions_pk
        primary key (state)
);
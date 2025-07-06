'use client';

import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <div className="app-header d-flex align-items-center">
            {/* Toggle buttons start */}
            <div className="d-flex">
                <button className="btn btn-primary me-2 toggle-sidebar" id="toggle-sidebar">
                    <i className="bi bi-chevron-left fs-5"></i>
                </button>
                <button className="btn btn-primary me-2 pin-sidebar" id="pin-sidebar">
                    <i className="bi bi-chevron-left fs-5"></i>
                </button>
            </div>
            {/* Toggle buttons end */}

            {/* App brand sm start */}
            <div className="app-brand-sm d-md-none d-sm-block">
                <Link href="/">
                    <img src="/assets/images/logo-sm.svg" className="logo" alt="Bootstrap Gallery" />
                </Link>
            </div>
            {/* App brand sm end */}

            {/* App header actions start */}
            <div className="header-actions">
                <div className="d-lg-block d-none me-2">
                    {/* Search container start */}
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search" />
                        <button className="btn btn-outline-primary" type="button">
                            <i className="bi bi-search fs-5"></i>
                        </button>
                    </div>
                    {/* Search container end */}
                </div>

                {/* Apps dropdown */}
                <div className="dropdown ms-3">
                    <a className="dropdown-toggle d-flex p-2 py-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-grid fs-2 lh-1"></i>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end shadow">
                        <div className="d-flex gap-2 m-2">
                            {["behance", "gatsby", "google", "bitcoin", "dribbble"].map((brand) => (
                                <a key={brand} href="#" className="g-col-4 p-2 border rounded-2">
                                    <img src={`/assets/images/brand-${brand}.svg`} className="img-3x" alt={brand} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications dropdown */}
                <div className="dropdown ms-3">
                    <a className="dropdown-toggle d-flex p-2 py-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="bi bi-bell fs-2 lh-1"></i>
                    </a>
                    <div className="dropdown-menu dropdown-menu-end shadow">
                        {[
                            {
                                img: 'user.png',
                                title: 'Sophie Michiels',
                                text: 'Membership has been ended.',
                                time: 'Today, 07:30pm',
                            },
                            {
                                img: 'user2.png',
                                title: 'Sophie Michiels',
                                text: 'Congratulate, James for new job.',
                                time: 'Today, 08:00pm',
                            },
                            {
                                img: 'user1.png',
                                title: 'Sophie Michiels',
                                text: 'Lewis added new schedule release.',
                                time: 'Today, 09:30pm',
                            },
                        ].map((item, i) => (
                            <div key={i} className="dropdown-item">
                                <div className="d-flex py-2 border-bottom">
                                    <img src={`/assets/images/${item.img}`} className="img-4x me-3 rounded-3" alt="Admin Theme" />
                                    <div className="m-0">
                                        <h5 className="mb-1 fw-semibold">{item.title}</h5>
                                        <p className="mb-1">{item.text}</p>
                                        <p className="small m-0 text-primary">{item.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border-top py-2 px-3 text-end">
                            <a href="#">View all</a>
                        </div>
                    </div>
                </div>

                {/* User dropdown */}
                <div className="dropdown ms-3">
                    <a id="userSettings" className="dropdown-toggle d-flex py-2 align-items-center text-decoration-none" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span className="d-none d-md-block me-2">Harriet Bradford</span>
                        <img src="/assets/images/user.png" className="rounded-circle img-3x" alt="Bootstrap Gallery" />
                    </a>
                    <div className="dropdown-menu dropdown-menu-end shadow">
                        <Link href="/profile" className="dropdown-item d-flex align-items-center">
                            <i className="bi bi-person fs-4 me-2"></i>Profile
                        </Link>
                        <Link href="/settings" className="dropdown-item d-flex align-items-center">
                            <i className="bi bi-gear fs-4 me-2"></i>Account Settings
                        </Link>
                        <Link href="/login" className="dropdown-item d-flex align-items-center">
                            <i className="bi bi-escape fs-4 me-2"></i>Logout
                        </Link>
                    </div>
                </div>
            </div>
            {/* App header actions end */}
        </div>
    );
};

export default Header;

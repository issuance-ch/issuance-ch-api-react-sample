import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  LogIn as IconLogIn,
  LogOut as IconLogOut,
  UserPlus as IconUserPlus,
} from "react-feather";

function LoggedOutView(props) {
  if (!props.currentCustomer) {
    return (
      <>
        <NavItem>
          <NavLink tag={Link} to="/register" className="d-flex">
            <IconUserPlus className="mr-2" />
            Sign Up
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink tag={Link} to="/login" className="d-flex">
            <IconLogIn className="mr-2" />
            Sign In
          </NavLink>
        </NavItem>
      </>
    );
  }

  return null;
}

function LoggedInView(props) {
  if (props.currentCustomer) {
    return (
      <>
        <NavItem>
          <NavLink tag={Link} to="/subscription">
            Subscriptions
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            tag={Link}
            to="/logout"
            className="d-flex"
            onClick={props.handleOnClick}
          >
            <IconLogOut className="mr-2" />
            Sign Out ({props.currentCustomer.username})
          </NavLink>
        </NavItem>
      </>
    );
  }

  return null;
}

function Header(props) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  function handleClickLogout() {
    props.AccountStore.logout().then(() => navigate("/", { replace: true }));
  }

  return (
    <Navbar color="light" light expand="md">
      <NavbarBrand tag={Link} to="/">
        {props.CommonStore.appName}
      </NavbarBrand>

      {props.CommonStore.appLoaded && (
        <>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <LoggedOutView
                currentCustomer={props.CustomerStore.currentCustomer}
              />
              <LoggedInView
                currentCustomer={props.CustomerStore.currentCustomer}
                handleOnClick={handleClickLogout}
              />
            </Nav>
          </Collapse>
        </>
      )}
    </Navbar>
  );
}

export default inject(
  "CommonStore",
  "AccountStore",
  "CustomerStore"
)(observer(Header));

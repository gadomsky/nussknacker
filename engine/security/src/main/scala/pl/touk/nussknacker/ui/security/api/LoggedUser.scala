package pl.touk.nussknacker.ui.security.api

import pl.touk.nussknacker.ui.security.api.GlobalPermission.GlobalPermission
import pl.touk.nussknacker.ui.security.api.Permission.Permission

sealed trait LoggedUser {
  val id: String
  def can(category: String, permission: Permission): Boolean
  val isAdmin: Boolean
}

object LoggedUser {
  def apply(id: String,
            categoryPermissions: Map[String, Set[Permission]] = Map.empty,
            globalPermissions: List[GlobalPermission] = Nil,
            isAdmin: Boolean = false): LoggedUser = {
    if (isAdmin) {
      AdminUser(id)
    } else {
      CommonUser(id, categoryPermissions, globalPermissions)
    }
  }

  def apply(id: String, rulesSet: RulesSet): LoggedUser = {
    if (rulesSet.isAdmin) {
      LoggedUser(id = id, isAdmin = true)
    } else {
      LoggedUser(
        id = id,
        categoryPermissions = rulesSet.permissions,
        globalPermissions = rulesSet.globalPermissions
      )
    }
  }
}

case class CommonUser(id: String,
                      categoryPermissions: Map[String, Set[Permission]] = Map.empty,
                      globalPermissions: List[GlobalPermission] = Nil) extends LoggedUser {
  def categories(permission: Permission): Set[String] = categoryPermissions.collect {
    case (category, permissions) if permissions contains permission => category
  }.toSet

  override def can(category: String, permission: Permission): Boolean = {
    categoryPermissions.get(category).exists(_ contains permission)
  }

  override val isAdmin: Boolean = false
}

case class AdminUser(id: String) extends LoggedUser {
  override def can(category: String, permission: Permission): Boolean = true
  override val isAdmin: Boolean = true
}

case object ReadOnlyTechUser extends LoggedUser {
  override val id: String = "tech_user"

  override def can(category: String, permission: Permission): Boolean = permission match {
    case Permission.Read => true
    case _ => false
  }

  override val isAdmin: Boolean = false
}
const pool = require('../boot/database/db_connect')
const logger = require('../middleware/winston')
const statusCodes = require('../constants/statusCodes')

const editPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    res.status(statusCodes.badRequest).json({ message: 'Missing parameters' })
  } else {
    if (oldPassword === newPassword) {
      res
        .status(statusCodes.badRequest)
        .json({ message: 'New password cannot be equal to old password' })
    } else {
      pool.query(
        'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
        [req.user.email, oldPassword],
        (err, rows) => {
          if (err) {
            logger.error(err.stack)
            res
              .status(statusCodes.queryError)
              .json({ error: 'Exception occurred while updating password' })
          } else {
            if (rows.rows[0]) {
              pool.query(
                "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
                [newPassword, req.user.email],
                (err, rows) => {
                  if (err) {
                    logger.error(err.stack)
                    res.status(statusCodes.queryError).json({
                      error: 'Exception occurred while updating password',
                    })
                  } else {
                    res
                      .status(statusCodes.success)
                      .json({ message: 'Password updated' })
                  }
                },
              )
            } else {
              res
                .status(statusCodes.badRequest)
                .json({ message: 'Incorrect password' })
            }
          }
        },
      )
    }
  }
}

const logout = async (req, res) => {
  if (req.session.user) {
    delete req.session.user
  }

  return res.status(200).json({ message: 'Disconnected' })
}

module.exports = {
  editPassword,
  logout,
}

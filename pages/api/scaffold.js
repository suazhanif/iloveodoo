import JSZip from 'jszip'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    techName, displayName, version, author, website,
    category, summary, license,
    includeModels, includeViews, includeSecurity,
    includeControllers, includeWizard, includeStatic,
    includeI18n, includeDemo, dependencies,
    modelName, modelDescription,
  } = req.body

  if (!techName || !displayName || !version || !author) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const snake = techName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  const ModelClass = modelName
    ? modelName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
    : snake.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
  const modelTech = modelName || snake
  const deps = dependencies && dependencies.length > 0 ? dependencies : ['base']
  const depsStr = deps.map(d => `'${d}'`).join(', ')
  const versionFull = `${version}.1.0.0`

  const dataFiles = []
  if (includeSecurity) {
    dataFiles.push(`'security/security_groups.xml'`)
    dataFiles.push(`'security/ir.model.access.csv'`)
  }
  if (includeViews) dataFiles.push(`'views/${modelTech}_views.xml'`)
  if (includeControllers) dataFiles.push(`'views/website_templates.xml'`)
  if (includeWizard) dataFiles.push(`'wizard/${snake}_wizard_views.xml'`)

  const demoFiles = []
  if (includeDemo) demoFiles.push(`'demo/demo_data.xml'`)

  const zip = new JSZip()
  const root = zip.folder(snake)

  // __init__.py
  const initImports = []
  if (includeModels) initImports.push(`from . import models`)
  if (includeControllers) initImports.push(`from . import controllers`)
  if (includeWizard) initImports.push(`from . import wizard`)
  root.file('__init__.py', initImports.length ? initImports.join('\n') + '\n' : '# -*- coding: utf-8 -*-\n')

  // __manifest__.py
  root.file('__manifest__.py', `# -*- coding: utf-8 -*-
{
    'name': '${displayName}',
    'version': '${versionFull}',
    'summary': '${summary || ''}',
    'description': """
        ${displayName}
        ${'='.repeat(displayName.length)}

        ${summary || 'Add your module description here.'}
    """,
    'author': '${author}',
    'website': '${website || ''}',
    'category': '${category || 'Uncategorized'}',
    'license': '${license || 'LGPL-3'}',
    'depends': [${depsStr}],
    'data': [
        ${dataFiles.join(',\n        ')}
    ],${demoFiles.length ? `\n    'demo': [\n        ${demoFiles.join(',\n        ')}\n    ],` : ''}
    'installable': True,
    'auto_install': False,
    'application': False,
}
`)

  // MODELS
  if (includeModels) {
    const models = root.folder('models')
    models.file('__init__.py', `# -*- coding: utf-8 -*-\nfrom . import ${modelTech}\n`)
    models.file(`${modelTech}.py`, `# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.exceptions import UserError, ValidationError


class ${ModelClass}(models.Model):
    _name = '${snake}.${modelTech}'
    _description = '${modelDescription || displayName}'
    _order = 'name asc'

    name = fields.Char(
        string='Name',
        required=True,
        copy=False,
        index=True,
    )
    active = fields.Boolean(
        string='Active',
        default=True,
    )
    description = fields.Text(
        string='Description',
    )
    state = fields.Selection(
        selection=[
            ('draft', 'Draft'),
            ('confirmed', 'Confirmed'),
            ('done', 'Done'),
            ('cancelled', 'Cancelled'),
        ],
        string='Status',
        default='draft',
        required=True,
        tracking=True,
    )
    user_id = fields.Many2one(
        comodel_name='res.users',
        string='Responsible',
        default=lambda self: self.env.user,
    )
    company_id = fields.Many2one(
        comodel_name='res.company',
        string='Company',
        default=lambda self: self.env.company,
    )
    notes = fields.Html(
        string='Notes',
    )

    @api.constrains('name')
    def _check_name(self):
        for record in self:
            if len(record.name) < 2:
                raise ValidationError('Name must be at least 2 characters long.')

    def action_confirm(self):
        for record in self:
            if record.state != 'draft':
                raise UserError('Only draft records can be confirmed.')
            record.state = 'confirmed'

    def action_done(self):
        self.write({'state': 'done'})

    def action_cancel(self):
        self.write({'state': 'cancelled'})

    def action_reset_draft(self):
        self.write({'state': 'draft'})
`)
  }

  // VIEWS
  if (includeViews) {
    const views = root.folder('views')
    views.file(`${modelTech}_views.xml`, `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <!-- Tree View -->
    <record id="view_${modelTech}_tree" model="ir.ui.view">
        <field name="name">${snake}.${modelTech}.tree</field>
        <field name="model">${snake}.${modelTech}</field>
        <field name="arch" type="xml">
            <tree string="${displayName}" decoration-muted="state == 'cancelled'" decoration-success="state == 'done'">
                <field name="name"/>
                <field name="user_id"/>
                <field name="company_id" groups="base.group_multi_company"/>
                <field name="state" widget="badge"
                    decoration-warning="state == 'draft'"
                    decoration-info="state == 'confirmed'"
                    decoration-success="state == 'done'"
                    decoration-danger="state == 'cancelled'"/>
            </tree>
        </field>
    </record>

    <!-- Form View -->
    <record id="view_${modelTech}_form" model="ir.ui.view">
        <field name="name">${snake}.${modelTech}.form</field>
        <field name="model">${snake}.${modelTech}</field>
        <field name="arch" type="xml">
            <form string="${displayName}">
                <header>
                    <button name="action_confirm" string="Confirm" type="object"
                        class="btn-primary" invisible="state != 'draft'"/>
                    <button name="action_done" string="Mark as Done" type="object"
                        class="btn-primary" invisible="state != 'confirmed'"/>
                    <button name="action_cancel" string="Cancel" type="object"
                        invisible="state in ['done', 'cancelled']"/>
                    <button name="action_reset_draft" string="Reset to Draft" type="object"
                        invisible="state != 'cancelled'"/>
                    <field name="state" widget="statusbar"
                        statusbar_visible="draft,confirmed,done"/>
                </header>
                <sheet>
                    <div class="oe_button_box" name="button_box"/>
                    <div class="oe_title">
                        <label for="name"/>
                        <h1>
                            <field name="name" placeholder="Name..."/>
                        </h1>
                    </div>
                    <group>
                        <group>
                            <field name="user_id"/>
                            <field name="company_id" groups="base.group_multi_company"/>
                        </group>
                        <group>
                            <field name="active" widget="boolean_toggle"/>
                        </group>
                    </group>
                    <notebook>
                        <page string="Description" name="description">
                            <field name="description" placeholder="Add a description..."/>
                        </page>
                        <page string="Notes" name="notes">
                            <field name="notes"/>
                        </page>
                    </notebook>
                </sheet>
                <div class="oe_chatter">
                    <field name="message_follower_ids"/>
                    <field name="activity_ids"/>
                    <field name="message_ids"/>
                </div>
            </form>
        </field>
    </record>

    <!-- Search View -->
    <record id="view_${modelTech}_search" model="ir.ui.view">
        <field name="name">${snake}.${modelTech}.search</field>
        <field name="model">${snake}.${modelTech}</field>
        <field name="arch" type="xml">
            <search string="${displayName}">
                <field name="name" filter_domain="[('name', 'ilike', self)]"/>
                <field name="user_id"/>
                <separator/>
                <filter string="Draft" name="draft" domain="[('state', '=', 'draft')]"/>
                <filter string="Confirmed" name="confirmed" domain="[('state', '=', 'confirmed')]"/>
                <filter string="Done" name="done" domain="[('state', '=', 'done')]"/>
                <separator/>
                <filter string="Archived" name="inactive" domain="[('active', '=', False)]"/>
                <group expand="0" string="Group By">
                    <filter string="Status" name="group_state" context="{'group_by': 'state'}"/>
                    <filter string="Responsible" name="group_user" context="{'group_by': 'user_id'}"/>
                </group>
            </search>
        </field>
    </record>

    <!-- Action -->
    <record id="action_${modelTech}" model="ir.actions.act_window">
        <field name="name">${displayName}</field>
        <field name="res_model">${snake}.${modelTech}</field>
        <field name="view_mode">tree,form</field>
        <field name="search_view_id" ref="view_${modelTech}_search"/>
        <field name="context">{}</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">
                Create your first ${displayName}
            </p>
        </field>
    </record>

    <!-- Menu Items -->
    <menuitem id="menu_${snake}_root"
        name="${displayName}"
        sequence="10"/>

    <menuitem id="menu_${snake}_main"
        name="${displayName}"
        parent="menu_${snake}_root"
        action="action_${modelTech}"
        sequence="10"/>

</odoo>
`)
  }

  // SECURITY
  if (includeSecurity) {
    const security = root.folder('security')
    security.file('security_groups.xml', `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <record id="module_category_${snake}" model="ir.module.category">
        <field name="name">${displayName}</field>
        <field name="sequence">10</field>
    </record>

    <record id="group_${snake}_user" model="res.groups">
        <field name="name">User</field>
        <field name="category_id" ref="module_category_${snake}"/>
        <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
    </record>

    <record id="group_${snake}_manager" model="res.groups">
        <field name="name">Manager</field>
        <field name="category_id" ref="module_category_${snake}"/>
        <field name="implied_ids" eval="[(4, ref('group_${snake}_user'))]"/>
        <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
    </record>

</odoo>
`)
    const modelAccess = includeModels
      ? `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_${snake}_${modelTech}_user,${snake}.${modelTech} user,model_${snake}_${modelTech},group_${snake}_user,1,1,1,0
access_${snake}_${modelTech}_manager,${snake}.${modelTech} manager,model_${snake}_${modelTech},group_${snake}_manager,1,1,1,1
`
      : `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink\n`
    security.file('ir.model.access.csv', modelAccess)
  }

  // CONTROLLERS
  if (includeControllers) {
    const controllers = root.folder('controllers')
    controllers.file('__init__.py', `# -*- coding: utf-8 -*-\nfrom . import main\n`)
    controllers.file('main.py', `# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request


class ${ModelClass}Controller(http.Controller):

    @http.route('/${snake}', type='http', auth='public', website=True)
    def index(self, **kwargs):
        records = request.env['${snake}.${modelTech}'].sudo().search([])
        return request.render('${snake}.website_index', {
            'records': records,
        })

    @http.route('/${snake}/<int:record_id>', type='http', auth='public', website=True)
    def detail(self, record_id, **kwargs):
        record = request.env['${snake}.${modelTech}'].sudo().browse(record_id)
        if not record.exists():
            return request.not_found()
        return request.render('${snake}.website_detail', {
            'record': record,
        })
`)
    if (!includeViews) root.folder('views')
    const views = root.folder('views')
    views.file('website_templates.xml', `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <template id="website_index" name="${displayName} - Index">
        <t t-call="website.layout">
            <div class="container mt-4">
                <h1>${displayName}</h1>
                <div class="row">
                    <t t-foreach="records" t-as="record">
                        <div class="col-md-4 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">
                                        <a t-attf-href="/${snake}/#{ record.id }">
                                            <t t-esc="record.name"/>
                                        </a>
                                    </h5>
                                    <span t-attf-class="badge bg-secondary">
                                        <t t-esc="record.state"/>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </t>
                </div>
            </div>
        </t>
    </template>

    <template id="website_detail" name="${displayName} - Detail">
        <t t-call="website.layout">
            <div class="container mt-4">
                <h1><t t-esc="record.name"/></h1>
                <p><t t-esc="record.description"/></p>
                <a href="/${snake}" class="btn btn-secondary">Back</a>
            </div>
        </t>
    </template>

</odoo>
`)
  }

  // WIZARD
  if (includeWizard) {
    const wizard = root.folder('wizard')
    wizard.file('__init__.py', `# -*- coding: utf-8 -*-\nfrom . import ${snake}_wizard\n`)
    wizard.file(`${snake}_wizard.py`, `# -*- coding: utf-8 -*-
from odoo import models, fields, api


class ${ModelClass}Wizard(models.TransientModel):
    _name = '${snake}.wizard'
    _description = '${displayName} Wizard'

    name = fields.Char(string='Name', required=True)
    note = fields.Text(string='Note')

    def action_confirm(self):
        self.ensure_one()
        # Add your wizard logic here
        return {'type': 'ir.actions.act_window_close'}
`)
    wizard.file(`${snake}_wizard_views.xml`, `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <record id="view_${snake}_wizard_form" model="ir.ui.view">
        <field name="name">${snake}.wizard.form</field>
        <field name="model">${snake}.wizard</field>
        <field name="arch" type="xml">
            <form string="${displayName} Wizard">
                <group>
                    <field name="name"/>
                    <field name="note"/>
                </group>
                <footer>
                    <button name="action_confirm" string="Confirm" type="object" class="btn-primary"/>
                    <button string="Cancel" class="btn-secondary" special="cancel"/>
                </footer>
            </form>
        </field>
    </record>

</odoo>
`)
  }

  // STATIC
  if (includeStatic) {
    const staticDir = root.folder('static')
    const src = staticDir.folder('src')
    const js = src.folder('js')
    const css = src.folder('css')
    src.folder('img')
    js.file(`${snake}.js`, `/** @odoo-module **/
import { Component, useState } from "@odoo/owl";

export class ${ModelClass}Component extends Component {
    static template = "${snake}.${ModelClass}Template";

    setup() {
        this.state = useState({ count: 0 });
    }

    increment() {
        this.state.count++;
    }
}
`)
    css.file(`${snake}.css`, `/* ${displayName} styles */

.${snake}-container {
    padding: 16px;
}

.${snake}-header {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 12px;
}
`)
  }

  // I18N
  if (includeI18n) {
    const i18n = root.folder('i18n')
    i18n.file(`${snake}.pot`, `# Translation of Odoo Server.
# This file contains the translation of the following modules:
# * ${snake}
#
msgid ""
msgstr ""
"Project-Id-Version: Odoo Server\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: 2024-01-01 00:00+0000\\n"
"PO-Revision-Date: 2024-01-01 00:00+0000\\n"
"Last-Translator: <>\\n"
"Language-Team: \\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: \\n"
"Plural-Forms: \\n"

#. module: ${snake}
#: model:ir.model,name:${snake}.model_${snake}_${modelTech}
msgid "${displayName}"
msgstr ""

#. module: ${snake}
#: model:ir.model.fields,field_description:${snake}.field_${snake}_${modelTech}__name
msgid "Name"
msgstr ""
`)
  }

  // DEMO
  if (includeDemo) {
    const demo = root.folder('demo')
    demo.file('demo_data.xml', `<?xml version="1.0" encoding="utf-8"?>
<odoo>

    <record id="demo_${modelTech}_1" model="${snake}.${modelTech}">
        <field name="name">Demo Record 1</field>
        <field name="description">This is a demo record created automatically.</field>
        <field name="state">draft</field>
    </record>

    <record id="demo_${modelTech}_2" model="${snake}.${modelTech}">
        <field name="name">Demo Record 2</field>
        <field name="description">Another demo record for testing purposes.</field>
        <field name="state">confirmed</field>
    </record>

</odoo>
`)
  }

  // Generate zip buffer
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${snake}.zip"`)
  res.setHeader('Content-Length', zipBuffer.length)
  res.status(200).send(zipBuffer)
}

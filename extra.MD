How to create metasettings

export async function action({ request }) {
const { admin, session,  sessionToken } = await authenticate.admin(request);

const formData = await request.formData();
const state = JSON.parse(formData.get("state"));

const response = await admin.graphql(
`#graphql
mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
metafieldsSet(metafields: $metafieldsSetInput) {
metafields {
id
namespace
key
}
userErrors {
field
message
}
}
}`,
{
variables: {
metafieldsSetInput: [
{
namespace: "settings",
key: "settings",
value: JSON.stringify({"onboarding":true, "onboardingStep":1}),
type: "json",
ownerId: state?.appId,
},
]
}
}
);
return json({'success': true});
}



-------

{%- liquid
capture panel_parameter
render 'url-parameters', key: 'panel'
endcapture

capture id_parameter
render 'url-parameters', key: 'id'
endcapture

capture action_parameter
render 'url-parameters', key: 'action'
endcapture

assign active_panel = panel_parameter | strip | downcase
assign id = id_parameter | strip | downcase
assign action = action_parameter | strip | downcase

if active_panel == blank
assign active_panel = 'overview'
endif

if id == blank
assign id = false
endif

if action == blank
assign action = false
endif

render 'account-panel', panel: active_panel, action: action, id: id
-%}



import { fetchSection, scrollTop } from '../utilities'

class ShopifyAccount extends HTMLElement {
constructor() {
super()

    window.shopifyAccount = this

    this.menu = this.querySelector('[data-account-menu]')
    this.content = this.querySelector('[data-account-content]')

    this.initialise()
}

initialise() {
document.addEventListener('click', this.onLinkClick.bind(this))

    document.addEventListener('click', this.onRefreshClick.bind(this))

    window.addEventListener('popstate', (e) => {
      this.params = new URLSearchParams(e.target.location.search)

      this.loadPanel()
    })

    this.params = new URLSearchParams(window.location.search)

    if (!this.params.has('panel')) {
      this.params.append('panel', 'overview')

      window.history.replaceState({}, '', `${location.pathname}?${this.params}`)
    } else {
      /**
       * If the active panel contains a module, import it
       */
      if (this.querySelector('[data-module]')) {
        import(
          /* webpackChunkName: "[request]" */ `../modules/${
            this.querySelector('[data-module]').dataset.module
          }`
        )
      }

      /**
       * If the panel is view-order, load it in
       */
      if (
        this.params.has('panel') &&
        this.params.has('token') &&
        this.params.get('panel') === 'orders' &&
        this.params.get('action') === 'view'
      ) {
        this.loadPanel()
      }
    }
}

onLinkClick(e) {
if (e.target.closest('a[href*="?panel"]') === null) return

    e.preventDefault()

    if (window.drawers.activeDrawer === 'account-menu') {
      window.drawers.activeDrawer = false
    }

    if (window.popup) {
      window.overlay.close()
      window.popup.close()
    }

    this.params = new URLSearchParams(e.target.closest('a').search)

    if (!this.params.has('panel')) return
    window.history.pushState(
      null,
      '',
      `${location.pathname}${Array.from(this.params).length > 0 ? '?' : ''}${
        this.params
      }`
    )

    this.updateMenu()

    this.loadPanel()
}

onRefreshClick(e) {
if (e.target.closest('[data-refresh-panel]') === null) return

    if (window.popup) {
      window.overlay.close()
      window.popup.close()

      this.loadPanel()
    }
}

updateMenu() {
this.menu.querySelectorAll('a[href*="panel="]').forEach((el) => {
el.classList.remove('active')
})

    this.menu
      .querySelector(`a[href*="${this.params.get('panel')}"]`)
      .classList.add('active')
}

loadPanel() {
this.loading = true

    scrollTop()

    let url = `/account?section_id=account-panel&${this.params}`

    if (
      this.params.has('panel') &&
      this.params.has('token') &&
      this.params.get('panel') === 'orders' &&
      this.params.get('action') === 'view'
    ) {
      url = `/account/orders/${this.params.get(
        'token'
      )}?section_id=account-panel&panel=orders&action=view`
    }

    fetchSection(url).then((section) => {
      this.content.innerHTML = section.innerHTML

      /**
       * If the content contains a module, import it
       */
      if (this.content.querySelector('[data-module]')) {
        import(
          /* webpackChunkName: "[request]" */ `../modules/${
            this.content.querySelector('[data-module]').dataset.module
          }`
        )
      }

      if (this.params.get('panel') === 'wishlist') {
        window.shopifyWishlist.initWishlistPage()
      }

      this.loading = false
    })
}

get panel() {
return this.params.get('panel')
}

set panel(val) {
this.params.set('panel', val)
}

set loading(val) {
this._loading = val

    this.classList.toggle('loading', val)
}
}

if (!customElements.get('shopify-account')) {
customElements.define('shopify-account', ShopifyAccount)
}



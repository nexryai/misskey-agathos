<template>
<div v-if="meta" class="rsqzvsbo">
    <div class="top">
        <MkAnimBg v-if="meta.backgroundImageUrl == null || meta.backgroundImageUrl == '' " style="position: absolute; top: 0; left: 0;" :scale="1.5"></MkAnimBg>
        <MkFeaturedPhotos v-else class="bg"/>
        <img :src="$instance.iconUrl || $instance.faviconUrl || '/favicon.ico'" class="instance-icon" @click="showMenu"/>
        <div class="emojis">
            <MkEmoji :normal="true" :no-style="true" emoji="👍"/>
            <MkEmoji :normal="true" :no-style="true" emoji="❤"/>
            <MkEmoji :normal="true" :no-style="true" emoji="😆"/>
            <MkEmoji :normal="true" :no-style="true" emoji="🎉"/>
            <MkEmoji :normal="true" :no-style="true" emoji="🍮"/>
        </div>
        <div class="main">
            <div class="fg">
                <h1>
                    <span class="text">{{ instanceName }}</span>
                </h1>
                <div class="about">
                    <div class="desc">
                        <MkA @click="os.pageWindow('/about');"> <i class="ti ti-info-circle"></i> {{ i18n.ts.instanceInfo }} </MkA>
                    </div>
                </div>
                <div class="entrance-form">
                    <MkSignin v-if="!dontHaveAccount" @login="onLogin"/>
                    <MkSignup v-else class="signup-form" @signup="onLogin" @signup-email-pending="onSignupEmailPending"/>
                </div>
                <div class="action">
                    <p> - or - </p>
                    <div v-if="meta.disableRegistration" class="warn">
                        <MkInfo warn>{{ i18n.ts.invitationRequiredToRegister }}</MkInfo>
                    </div>
                    <MkButton v-if="!dontHaveAccount" inline rounded gradate data-cy-signup style="margin-right: 12px;" @click="signup()">{{ i18n.ts.signup }}</MkButton>
                    <MkButton v-else inline rounded gradate data-cy-signup style="margin-right: 12px;" @click="signin()">{{ i18n.ts.login }}</MkButton>
                    <MkButton inline rounded data-cy-signin style="margin-left: 12px;" @click="jumpToExplore()">{{ i18n.ts.explore }}</MkButton>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script lang="ts" setup>
import { } from "vue";
import MkButton from "@/components/MkButton.vue";
import MkFeaturedPhotos from "@/components/MkFeaturedPhotos.vue";
import { instanceName } from "@/config";
import * as os from "@/os";
import { i18n } from "@/i18n";
import MkInfo from "@/components/MkInfo.vue";
import MkSignin from "@/components/MkSignin.vue";
import MkSignup from "@/components/MkSignup.vue";
import { login } from "@/account";
import MkAnimBg from "@/components/MkAnimBg.vue";

let meta = $ref();
let dontHaveAccount = $ref(false);

os.api("meta", { detail: true }).then(_meta => {
    meta = _meta;
});

function signup() {
    dontHaveAccount = true;
}

function signin() {
    dontHaveAccount = false;
}

function jumpToExplore() {
    window.location.href = "/explore";
}

function showMenu(ev) {
    os.popupMenu([{
        text: i18n.ts.instanceInfo,
        icon: "ti ti-info-circle",
        action: () => {
            os.pageWindow("/about");
        },
    }, null, {
        text: i18n.ts.help,
        icon: "ti ti-help",
        action: () => {
            window.open("https://misskey-hub.net/help.md", "_blank");
        },
    }], ev.currentTarget ?? ev.target);
}

function onLogin(res): void {
    login(res.i);
}

function onSignupEmailPending() {}
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	> .top {
		display: flex;
		text-align: center;
		min-height: 100vh;
		box-sizing: border-box;
		padding: 16px;

		> .bg {
			position: fixed;
			top: 0;
			right: 0;
			width: calc(100% + 20px);
			height: calc(100% + 20px);
			margin: -10px;
		}

        > .instance-icon {
            position: absolute;
            top: 28px;
            left: 28px;
            width: 50px;
            height: auto;
            border-radius: 4px;
        }

		> .emojis {
			position: absolute;
			bottom: 32px;
			right: 35px;

			> * {
				margin-right: 8px;
			}

			@media (max-width: 1200px) {
				display: none;
			}
		}

		> .main {
			position: relative;
			width: min(480px, 100%);
			margin: auto auto auto auto;
			background: var(--panel);
			border-radius: var(--radius);
			box-shadow: 0 12px 32px rgb(0 0 0 / 25%);

			@media (max-width: 1200px) {
				margin: auto;
			}

            @media (max-width: 800px) {
                margin-top: 80px;
            }

			> .icon {
				width: 85px;
				margin-top: -47px;
				border-radius: 100%;
				vertical-align: bottom;
			}

			> .menu {
				position: absolute;
				top: 16px;
				right: 16px;
				width: 32px;
				height: 32px;
				border-radius: 8px;
				font-size: 18px;
			}

			> .fg {
				position: relative;
				z-index: 1;

				> h1 {
					display: block;
					margin: 0;
					padding: 32px 32px 24px 32px;
					font-size: 1.4em;

					> .logo {
						vertical-align: bottom;
						max-height: 120px;
						max-width: min(100%, 300px);
					}
				}

				> .about {
					padding: 0 32px;
				}

                > .entrance-form {
                    > .signup-form {
                        padding: 32px;
                    }
                }

				> .action {
                    padding: 0 32px 32px;

                    > * {
						line-height: 28px;
					}

                    > .warn {
                        padding: 2px 0 16px;
                        line-height: 22px;
                    }
				}
			}
		}
	}
}
</style>

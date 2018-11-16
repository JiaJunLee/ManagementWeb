<template>
  <v-app id="inspire">
    <v-snackbar :color="alert.color" v-model="alert.visible" :timeout="alert.timeout" top>
      {{ alert.message }}
      <v-btn flat @click="alert.visible = false">Close</v-btn>
    </v-snackbar>
    <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
      <v-list dense>
        <template v-for="item in items">
          <v-layout v-if="item.heading" :key="item.heading" row align-center>
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-flex>
            <v-flex xs6 class="text-xs-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-flex>
          </v-layout>
          <v-list-tile :key="item.text" @click="handleSelected(item.text)">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue darken-3" dark app fixed>
      <v-toolbar-title style="width: 240px" class="ml-0 pl-0">
        <v-layout  justify-center align-center>
          <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
          <span>Smart Management</span>
        </v-layout>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon large>
        <v-tooltip bottom>
          <v-avatar size="34px" slot="activator">
            <img src="http://p0.ifengimg.com/a/2018_45/bcc07f5bc8bf9cf_size26_w640_h584.jpg" alt="Vuetify">
          </v-avatar>
          <span>User Center</span>
        </v-tooltip>
      </v-btn>
      <v-subheader class="hidden-md-and-down">Username</v-subheader>
      <v-tooltip bottom>
        <v-btn icon slot="activator">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
        <span>Exit</span>
      </v-tooltip>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height>
        <v-layout justify-center>
          <v-flex xs11>
            <!--data table-->
            <v-data-table :headers="headers" :items="desserts" class="elevation-1" loading>
              <template slot="no-data">
                <v-alert :value="true" color="error" icon="warning">Sorry, nothing to display here :(</v-alert>
              </template>
              <template slot="items" slot-scope="props">
                <td class="text-xs-center">{{ props.item.name }}</td>
                <td class="text-xs-center">{{ props.item.calories }}</td>
                <td class="text-xs-center">{{ props.item.fat }}</td>
                <td class="text-xs-center">{{ props.item.carbs }}</td>
                <td class="text-xs-center">{{ props.item.iron }}</td>
                <td class="text-xs-center" style="padding: 14px;" width="360">
                  <v-card>
                    <v-card-title primary-title>
                      <div>
                        <div v-if="props.item.remarks">{{ props.item.remarks }}</div>
                        <div v-else class="grey--text">
                          Empty remarks
                        </div>
                      </div>
                    </v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn small color="blue" class="white--text" @click="editRemarksDialog = true">EDIT
                        <v-icon right small>create</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </td>
              </template>
            </v-data-table>
            <!--edit dialog-->
            <v-dialog v-model="editRemarksDialog" max-width="460">
              <v-card>
                <v-card-title class="headline">Edit remarks</v-card-title>
                <v-textarea outline value="Demo remarks" style="margin: 0 18px"></v-textarea>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="gray darken-1" flat="flat" @click="editRemarksDialog = false">cancel</v-btn>
                  <v-btn color="blue darken-1" flat="flat" @click="saveRemarks">save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-flex>

        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    alert: {
      visible: false,
      color: "green",
      timeout: 3000,
      message: "Successful!"
    },
    editRemarksDialog: false,
    dialog: false,
    drawer: null,
    items: [
      { icon: "person", text: "Employee" },
      { icon: "group", text: "User groups" },
      { icon: "record_voice_over", text: "Customers" },
      { icon: "how_to_reg", text: "Incoming customers" }
    ],
    headers: [
      { text: "Name", value: "name", align:'center' },
      { text: "Phone number", value: "calories", align:'center' },
      { text: "Sex", value: "fat", align:'center' },
      { text: "Birth", value: "carbs", align:'center' },
      { text: "Visibility user groups", value: "protein", align:'center' },
      { text: "Remarks", value: "iron", align:'center' }
    ],
    desserts: [
      {
        value: false,
        name: "Frozen Yogurt",
        calories: 159,
        fat: 6.0,
        carbs: 24,
        protein: 4.0,
        iron: "1%",
        remarks: "first remarksfirst remarksfirst remarksfirst remarksfirst remarksfirst remarksfirst remarksfirst remarksfirst remarksfirst remarks"
      },
      {
        value: false,
        name: "Ice cream sandwich",
        calories: 237,
        fat: 9.0,
        carbs: 37,
        protein: 4.3,
        iron: "1%",
        remarks: ""
      }
    ]
  }),
  props: {
    source: String
  },
  methods: {
    handleSelected(selected) {
      alert(selected);
    },
    saveRemarks() {
      this.editRemarksDialog = false;
      this.alertMessage();
    },
    alertMessage(message = "Successful!", color = "green") {
      this.alert.visible = true;
      this.alert.color = color;
      this.alert.message = message;
    }
  }
};
</script>

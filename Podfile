require File.join(File.dirname(`node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")

platform :ios, '13.0'
prepare_react_native_project!

# Fix for Firebase Swift pods integration issue
use_modular_headers!

target 'LiftSmart' do
  use_expo_modules!
  post_integrate do |installer|
    begin
      expo_patch_react_imports!(installer)
    rescue => e
      pod_install_exit_code = e.respond_to?(:exit_code) ? e.exit_code : 1
      Pod::UI.warn e.message
      exit pod_install_exit_code
    end
  end
end
